import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, MonitorCog } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	createRemoteAgentMutation,
	listAgentsOptions,
	rotateRemoteAgentTokenMutation,
} from "~/client/api-client/@tanstack/react-query.gen";
import type { CreateRemoteAgentResponse, ListAgentsResponse } from "~/client/api-client/types.gen";
import { Alert, AlertDescription, AlertTitle } from "~/client/components/ui/alert";
import { Button } from "~/client/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/client/components/ui/card";
import { getMachineDisplayName } from "~/lib/machine-name";
import { CreateMachineForm, DeploymentInstructions } from "../components/machine-setup-forms";
import { MachineConnectionSuccess } from "../components/machine-connection-success";
import { useTranslation } from "~/client/lib/i18n";

type Agent = ListAgentsResponse[number];
type Enrollment = Pick<Agent, "id" | "credentialVersion" | "name"> & { issuedAt: number };

const steps = ["Name your machine", "Connect", "Connected"];

export function MachineSetupPage({ agentId }: { agentId?: string }) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [targetId, setTargetId] = useState(agentId);
	const [credential, setCredential] = useState<CreateRemoteAgentResponse | null>(null);
	const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
	const [connected, setConnected] = useState<Agent | null>(null);
	const [now, setNow] = useState(Date.now);

	const agentsQuery = useQuery({
		...listAgentsOptions(),
		refetchInterval: targetId && !connected ? 2_000 : false,
		refetchIntervalInBackground: false,
	});

	const target = agentsQuery.data?.find((agent) => agent.id === targetId && agent.kind === "remote");
	let currentStep = 0;
	if (targetId) currentStep = 1;
	if (connected) currentStep = 2;

	const headingRef = useRef<HTMLHeadingElement>(null);

	const acceptCredential = (result: CreateRemoteAgentResponse) => {
		setTargetId(result.agent.id);
		setEnrollment({
			id: result.agent.id,
			credentialVersion: result.agent.credentialVersion,
			name: result.agent.name,
			issuedAt: Date.now(),
		});
		setCredential(result);
		setNow(Date.now());
	};

	const createAgent = useMutation({
		...createRemoteAgentMutation(),
		gcTime: 0,
		onSuccess: (result) => {
			acceptCredential(result);
			createAgent.reset();
		},
	});

	const rotateCredential = useMutation({
		...rotateRemoteAgentTokenMutation(),
		gcTime: 0,
		onSuccess: (result) => {
			acceptCredential(result);
			rotateCredential.reset();
		},
	});

	useEffect(() => {
		headingRef.current?.focus();
	}, [currentStep]);

	useEffect(() => {
		if (!credential) return;

		const interval = window.setInterval(() => setNow(Date.now()), 1_000);
		return () => window.clearInterval(interval);
	}, [credential]);

	if (
		enrollment &&
		target &&
		!agentsQuery.isError &&
		target.revokedAt === null &&
		target.credentialVersion === enrollment.credentialVersion + 1 &&
		target.status === "online"
	) {
		setConnected(target);
		setCredential(null);
		setEnrollment(null);
	}

	const backToMachines = () =>
		void navigate({ to: "/settings", search: { scope: "organization" }, hash: "machines" });
	const replaceCode = () => {
		setCredential(null);
		setEnrollment(null);
		rotateCredential.reset();
	};

	const hasFreshStatus = agentsQuery.isSuccess;
	const consumed = !!enrollment && !!target && target.credentialVersion === enrollment.credentialVersion + 1;
	const expired = !!credential && now >= credential.expiresAt && !consumed;
	const replaced = !!enrollment && !!target && target.credentialVersion > enrollment.credentialVersion + 1;
	const unavailable =
		hasFreshStatus &&
		!!enrollment &&
		((!target && agentsQuery.dataUpdatedAt >= enrollment.issuedAt) || target?.revokedAt != null || replaced);
	const canDeploy = credential && !expired && !unavailable;
	const machineName = getMachineDisplayName(connected?.name ?? enrollment?.name ?? target?.name ?? "");

	let title = t("settings.machineSetup.connectMachine");
	if (currentStep === 1) title = t("settings.machineSetup.reconnectYourMachine");
	if (currentStep === 1 && (target || enrollment)) title = t("settings.machineSetup.connectNamed", { machineName });
	if (connected) title = t("settings.machineSetup.connectionSuccessful");

	return (
		<div className="container mx-auto space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
							<MonitorCog className="w-5 h-5 text-primary" aria-hidden="true" />
						</div>
						<CardTitle>
							<h1 ref={headingRef} tabIndex={-1} className="outline-none">
								{title}
							</h1>
						</CardTitle>
					</div>
					<CardDescription>
						{t("settings.machineSetup.stepOf", {
							value: currentStep + 1,
							length: steps.length,
							value2: steps[currentStep],
						})}
					</CardDescription>
				</CardHeader>
				<CardContent className="min-w-0 space-y-6">
					{currentStep === 0 && (
						<CreateMachineForm
							pending={createAgent.isPending}
							failed={createAgent.isError}
							onCreate={(name) => createAgent.mutate({ body: { name } })}
							onCancel={backToMachines}
						/>
					)}

					{currentStep === 1 && (
						<>
							{agentsQuery.isError && (
								<Alert variant="destructive">
									<AlertTitle>{t("settings.machineSetup.couldNotCheckThe")}</AlertTitle>
									<AlertDescription>
										{t("settings.machineSetup.checkYourConnectionTo")}
									</AlertDescription>
									<Button
										variant="outline"
										className="mt-3"
										onClick={() => void agentsQuery.refetch()}
										loading={agentsQuery.isFetching}
									>
										{t("settings.machineSetup.retryConnectionCheck")}
									</Button>
								</Alert>
							)}

							{!credential && (
								<>
									{agentsQuery.isPending && (
										<output className="block text-sm text-muted-foreground">
											{t("settings.machineSetup.loadingMachine")}
										</output>
									)}
									{hasFreshStatus && !target && (
										<Alert variant="destructive">
											<AlertTitle>{t("settings.machineSetup.machineUnavailable")}</AlertTitle>
											<AlertDescription>
												{t("settings.machineSetup.thisMachineNoLonger")}
											</AlertDescription>
										</Alert>
									)}
									{target && (
										<div className="space-y-5">
											<Alert variant="warning">
												<AlertTitle>
													{t("settings.machineSetup.reconnect", { machineName: machineName })}
												</AlertTitle>
												<AlertDescription>
													{t("settings.machineSetup.thisDisconnectsTheMachine")}
												</AlertDescription>
											</Alert>
											{rotateCredential.isError && (
												<p role="alert" className="text-sm text-destructive">
													{t("settings.machineSetup.couldNotGetA")}
												</p>
											)}
											<div className="flex justify-end gap-2 pt-4 border-t">
												<Button variant="secondary" onClick={backToMachines}>
													{t("common.cancel")}
												</Button>
												<Button
													disabled={!hasFreshStatus}
													loading={rotateCredential.isPending}
													onClick={() =>
														rotateCredential.mutate({ path: { agentId: target.id } })
													}
												>
													{t("settings.machineSetup.getNewConnectionCode")}
													<ArrowRight className="ml-2" aria-hidden="true" />
												</Button>
											</div>
										</div>
									)}
								</>
							)}

							{(expired || unavailable) && (
								<Alert variant="warning">
									<AlertTitle>
										{expired
											? t("settings.machineSetup.connectionCodeExpired")
											: t("settings.machineSetup.connectionCodeNoLonger")}
									</AlertTitle>
									<AlertDescription>
										{expired && t("settings.machineSetup.getAFreshCode")}
										{!expired && t("settings.machineSetup.theMachineWasRemoved")}
									</AlertDescription>
									{target && (
										<Button variant="outline" className="mt-3" onClick={replaceCode}>
											{t("settings.machineSetup.reconnectMachine")}
										</Button>
									)}
								</Alert>
							)}
							{credential && !expired && !unavailable && (
								<Alert>
									<Loader2 className="animate-spin" aria-hidden="true" />
									<AlertTitle>
										{t("settings.machineSetup.waitingForToConnect", { machineName: machineName })}
									</AlertTitle>
									{target?.status === "degraded" && (
										<AlertDescription>
											{t("settings.machineSetup.couldnTFinishConnecting")}
										</AlertDescription>
									)}
									{consumed && target?.status === "offline" && (
										<AlertDescription>
											{t("settings.machineSetup.makeSureTheSoftware")}
										</AlertDescription>
									)}
								</Alert>
							)}
							{canDeploy && <DeploymentInstructions key={credential.token} credential={credential} />}
							{(credential || !target) && (
								<div className="flex justify-end gap-2 pt-4 border-t">
									<Button variant="secondary" onClick={backToMachines}>
										{t("settings.machineSetup.backToMachines")}
									</Button>
								</div>
							)}
						</>
					)}

					{connected && (
						<MachineConnectionSuccess
							agent={connected}
							onDone={backToMachines}
							onCreateSource={() => void navigate({ to: "/volumes/create" })}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
