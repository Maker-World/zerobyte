import { toControllerOrigin } from "@zerobyte/contracts/agent-connection";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { CreateRemoteAgentResponse } from "~/client/api-client/types.gen";
import { Alert, AlertDescription, AlertTitle } from "~/client/components/ui/alert";
import { Button } from "~/client/components/ui/button";
import { Input } from "~/client/components/ui/input";
import { Label } from "~/client/components/ui/label";
import { Textarea } from "~/client/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/client/components/ui/tabs";
import { useTimeFormat } from "~/client/lib/datetime";
import {
	getMachineDisplayName,
	isValidMachineName,
	MACHINE_NAME_MAX_LENGTH,
	normalizeMachineName,
} from "~/lib/machine-name";
import { createConnectionCommand } from "./connection-command";
import { createDockerCompose } from "./connection-docker";
import { useTranslation } from "~/client/lib/i18n";

const installationGuide = "https://zerobyte.app/docs/guides/remote-agents";

function CopyField({
	value,
	label = "Connection command",
	rows = 6,
	wrap = "soft",
}: {
	value: string;
	label?: string;
	rows?: number;
	wrap?: "soft" | "off";
}) {
	const { t } = useTranslation();
	const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

	const fieldId = useId();
	const commandRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (copyStatus !== "copied") return;

		const timeout = window.setTimeout(() => setCopyStatus("idle"), 3_000);
		return () => window.clearTimeout(timeout);
	}, [copyStatus]);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopyStatus("copied");
		} catch {
			setCopyStatus("failed");
			commandRef.current?.focus();
			commandRef.current?.select();
		}
	};

	return (
		<div className="min-w-0 space-y-2">
			<Label htmlFor={fieldId}>{label}</Label>
			<div className="flex min-w-0 items-start gap-2">
				<Textarea
					ref={commandRef}
					id={fieldId}
					readOnly
					value={value}
					rows={rows}
					wrap={wrap}
					className="max-h-80 min-w-0 flex-1 resize-none overflow-auto font-mono text-xs"
					onFocus={(event) => event.currentTarget.select()}
					onClick={(event) => event.currentTarget.select()}
				/>
				<Button
					type="button"
					variant="outline"
					size="icon"
					className="shrink-0"
					aria-label={`${copyStatus === "copied" ? "Copied" : "Copy"} ${label.toLowerCase()}`}
					onClick={copy}
				>
					{copyStatus === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
				</Button>
			</div>
			<p
				aria-live="polite"
				aria-atomic="true"
				className={copyStatus === "failed" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
			>
				{copyStatus === "copied" && `${label} copied.`}
				{copyStatus === "failed" && t("settings.machineSetupForms.couldNotCopyThe")}
			</p>
		</div>
	);
}

export function DeploymentInstructions({ credential }: { credential: CreateRemoteAgentResponse }) {
	const { t } = useTranslation();
	const { formatDateTime } = useTimeFormat();
	const insecure = toControllerOrigin(credential.controllerUrl).startsWith("http:");

	return (
		<div className="min-w-0 space-y-4">
			{insecure && (
				<Alert variant="warning">
					<AlertTriangle className="size-4" aria-hidden="true" />
					<AlertTitle>{t("settings.machineSetupForms.connectionIsnTSecure")}</AlertTitle>
					<AlertDescription>
						{t("settings.machineSetupForms.credentialsAndControllerTraffic")}
					</AlertDescription>
				</Alert>
			)}
			<Tabs defaultValue="linux" className="min-w-0 gap-4">
				<TabsList aria-label={t("settings.machineSetupForms.deploymentMethod")} className="justify-start">
					<TabsTrigger value="linux">{t("settings.machineSetupForms.linuxInstaller")}</TabsTrigger>
					<TabsTrigger value="docker">{t("settings.machineSetupForms.docker")}</TabsTrigger>
				</TabsList>
				<TabsContent value="linux" className="min-w-0 space-y-4">
					<p className="text-sm text-muted-foreground">
						{t("settings.machineSetupForms.copyAndRunThis", {
							machineDisplayName: getMachineDisplayName(credential.agent.name),
						})}
					</p>
					<CopyField value={createConnectionCommand(credential.controllerUrl, credential.token)} />
				</TabsContent>
				<TabsContent value="docker" className="min-w-0 space-y-4">
					<ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
						<li>
							{t("settings.machineSetupForms.saveThisAs")} <code>compose.yaml</code>{" "}
							{t("settings.machineSetupForms.on", {
								machineDisplayName: getMachineDisplayName(credential.agent.name),
							})}
						</li>
						<li>
							{t("settings.machineSetupForms.replace")} <code>/path/on/host</code>{" "}
							{t("settings.machineSetupForms.withTheFolderTo")}
						</li>
						<li>
							{t("settings.machineSetupForms.run")} <code>docker compose up -d</code>.
						</li>
					</ol>
					<CopyField
						label={t("settings.machineSetupForms.dockerComposeConfiguration")}
						rows={16}
						wrap="off"
						value={createDockerCompose(
							credential.controllerUrl,
							credential.token,
							getMachineDisplayName(credential.agent.name),
						)}
					/>
					<p className="text-sm text-muted-foreground">
						{t("settings.machineSetupForms.reconnectingUpdateOnlyThe")}
					</p>
				</TabsContent>
			</Tabs>
			<p className="text-sm text-muted-foreground">{t("settings.machineSetupForms.keepThisPageOpen")}</p>
			<p className="text-xs text-muted-foreground">
				{t("settings.machineSetupForms.expires", { dateTime: formatDateTime(credential.expiresAt) })}{" "}
				<a href={installationGuide} target="_blank" rel="noreferrer" className="underline underline-offset-4">
					{t("settings.machineSetupForms.setupGuide")}
				</a>
			</p>
		</div>
	);
}

export function CreateMachineForm({
	pending,
	failed,
	onCreate,
	onCancel,
}: {
	pending: boolean;
	failed: boolean;
	onCreate: (name: string) => void;
	onCancel: () => void;
}) {
	const { t } = useTranslation();
	const [machineName, setMachineName] = useState("");

	const isValid = isValidMachineName(machineName);
	const hasError = machineName.length > 0 && !isValid;

	return (
		<form
			className="space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				if (isValid && !pending) onCreate(normalizeMachineName(machineName));
			}}
		>
			<div className="space-y-2">
				<Label htmlFor="remote-machine-name">{t("settings.machineSetupForms.machineName")}</Label>
				<Input
					id="remote-machine-name"
					value={machineName}
					placeholder={t("settings.machineSetupForms.eGArchiveServer")}
					disabled={pending}
					onChange={(event) => setMachineName(event.target.value)}
					maxLength={MACHINE_NAME_MAX_LENGTH}
					aria-invalid={hasError}
					aria-describedby={
						hasError ? "remote-machine-name-hint remote-machine-name-error" : "remote-machine-name-hint"
					}
					required
				/>
				<p id="remote-machine-name-hint" className="text-pretty text-xs text-muted-foreground">
					{t("settings.machineSetupForms.chooseANameYou")}
				</p>
				{hasError && (
					<p id="remote-machine-name-error" role="alert" className="text-pretty text-sm text-destructive">
						{t("settings.machineSetupForms.enterANonEmpty")}
					</p>
				)}
			</div>
			{failed && (
				<p role="alert" className="text-sm text-destructive">
					{t("settings.machineSetupForms.couldNotGetThe")}
				</p>
			)}
			<div className="flex justify-end gap-2 pt-4 border-t">
				<Button type="button" variant="secondary" onClick={onCancel}>
					{t("common.cancel")}
				</Button>
				<Button type="submit" loading={pending} disabled={!isValid}>
					{t("common.continue")}
				</Button>
			</div>
		</form>
	);
}
