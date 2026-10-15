import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { Effect } from "effect";
import { afterEach, expect, test, vi } from "vitest";
import { fromPartial } from "@total-typescript/shoehorn";
import { AGENT_PROTOCOL_VERSION, createAgentMessage, parseControllerMessage } from "@zerobyte/contracts/agent-protocol";
import { buildEnv, cleanupTemporaryKeys } from "@zerobyte/core/restic/server";
import { resticDeps as agentResticDeps } from "../../../../../apps/agent/src/restic/deps";
import { config } from "~/server/core/config";
import { cryptoUtils } from "~/server/utils/crypto";
import { createTestOrganization } from "~/test/helpers/organization";
import { createTestRepository } from "~/test/helpers/repository";
import { createTestBackupSchedule } from "~/test/helpers/backup";
import { getAgentController, type ProcessWithAgentRuntime } from "../../agents/agents-manager";
import { createTrustedFilesystemSource } from "../../volumes/__tests__/trusted-filesystem-source.fixture";
import { encryptRepositoryConfig } from "../../repositories/repository-config-secrets";
import { backupExecutor } from "../backup-executor";

vi.unmock("~/server/utils/crypto");

const ORGANIZATION_PASSWORD = "organization-default-password";
const CUSTOM_PASSWORD = "custom-repository-password";

afterEach(async () => {
	await Effect.runPromise(getAgentController().stop);
	delete (process as ProcessWithAgentRuntime).__zerobyteAgentRuntime;
	vi.restoreAllMocks();
});

test.each([
	{
		name: "existing repository with a custom password",
		isExistingRepository: true,
		customPassword: CUSTOM_PASSWORD,
		organizationPassword: ORGANIZATION_PASSWORD,
		expectedPassword: CUSTOM_PASSWORD,
	},
	{
		name: "custom password without an organization default",
		isExistingRepository: true,
		customPassword: "custom\npassword-🔑",
		organizationPassword: undefined,
		expectedPassword: "custom\npassword-🔑",
	},
	{
		name: "existing repository without a custom password",
		isExistingRepository: true,
		customPassword: undefined,
		organizationPassword: ORGANIZATION_PASSWORD,
		expectedPassword: ORGANIZATION_PASSWORD,
	},
	{
		name: "existing repository with an empty custom password",
		isExistingRepository: true,
		customPassword: "",
		organizationPassword: ORGANIZATION_PASSWORD,
		expectedPassword: ORGANIZATION_PASSWORD,
	},
	{
		name: "new repository with an inactive custom password",
		isExistingRepository: false,
		customPassword: CUSTOM_PASSWORD,
		organizationPassword: ORGANIZATION_PASSWORD,
		expectedPassword: ORGANIZATION_PASSWORD,
	},
	{
		name: "new repository using the organization default",
		isExistingRepository: undefined,
		customPassword: undefined,
		organizationPassword: ORGANIZATION_PASSWORD,
		expectedPassword: ORGANIZATION_PASSWORD,
	},
])(
	"dispatches only the effective runtime password for $name",
	async ({ isExistingRepository, customPassword, organizationPassword, expectedPassword }) => {
		const organization = await createTestOrganization({
			id: randomUUID(),
			metadata: {
				resticPassword: await cryptoUtils.sealSecret(organizationPassword ?? ""),
			},
		});
		const { agentId, volume } = await createTrustedFilesystemSource(organization.id);
		const repository = await createTestRepository({
			organizationId: organization.id,
			type: "s3",
			config: await encryptRepositoryConfig({
				backend: "s3",
				endpoint: "https://s3.example.com",
				bucket: "backups",
				accessKeyId: "test-key",
				secretAccessKey: "test-secret",
				isExistingRepository,
				customPassword,
			}),
		});
		const schedule = await createTestBackupSchedule({
			organizationId: organization.id,
			volumeId: volume.id,
			repositoryId: repository.id,
		});

		vi.spyOn(config, "runtime", "get").mockReturnValue("server");
		vi.spyOn(config, "flags", "get").mockReturnValue({ ...config.flags, enableRemoteAgents: true });
		vi.spyOn(Bun, "serve").mockReturnValue(fromPartial({ port: 4567, stop: async () => {} }));

		const controller = getAgentController();
		const connection = {
			id: randomUUID(),
			agentId,
			agentName: "Remote backup agent",
			agentKind: "remote" as const,
			organizationId: organization.id,
			credentialVersion: 0,
		};
		const transport = { send: vi.fn((_message: string) => 1), close: vi.fn() };

		await Effect.runPromise(controller.start);
		await controller.socket.open(connection, transport);
		await controller.socket.message(
			connection,
			transport,
			createAgentMessage("agent.ready", {
				agentId,
				protocolVersion: AGENT_PROTOCOL_VERSION,
				hostname: "remote-host",
				platform: "linux",
				capabilities: { trustedRoots: [{ id: "photos", label: "Photos", canBackup: true }] },
			}),
		);
		await expect(Effect.runPromise(controller.waitForReady(agentId, "1 second"))).resolves.toBe(true);

		const completion = backupExecutor.execute({
			jobId: randomUUID(),
			scheduleId: schedule.id,
			schedule,
			volume,
			repository,
			organizationId: organization.id,
			signal: new AbortController().signal,
			onProgress: () => {},
		});
		const messages = () =>
			transport.send.mock.calls.flatMap(([text]) => {
				const parsed = parseControllerMessage(text);

				if (!parsed?.success || parsed.data.type !== "backup.run") return [];

				return [{ text, payload: parsed.data.payload }];
			});

		await vi.waitFor(() => expect(messages()).toHaveLength(1));
		const message = messages()[0];

		expect(message.payload.runtime.password).toBe(expectedPassword);
		expect(message.payload.repositoryConfig.customPassword).toBe(customPassword);
		if (isExistingRepository && customPassword) {
			expect(message.text).not.toContain(ORGANIZATION_PASSWORD);
		}

		const deps = agentResticDeps(message.payload.runtime.password);
		const env = await buildEnv(message.payload.repositoryConfig, organization.id, deps);

		try {
			expect(await fs.readFile(env.RESTIC_PASSWORD_FILE!, "utf8")).toBe(expectedPassword);
		} finally {
			await cleanupTemporaryKeys(env, deps);
		}

		await controller.socket.close(connection);
		await expect(completion).resolves.toMatchObject({ status: "cancelled" });
	},
);
