import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Plus, RefreshCw } from "lucide-react";
import { useRef, useState } from "react";
import {
	deleteRemoteAgentMutation,
	listAgentsOptions,
	revokeRemoteAgentTokenMutation,
} from "~/client/api-client/@tanstack/react-query.gen";
import { Alert, AlertAction, AlertContent, AlertDescription, AlertTitle } from "~/client/components/ui/alert";
import { Button } from "~/client/components/ui/button";
import { getMachineDisplayName } from "~/lib/machine-name";
import { ConfirmActionDialog, type ConfirmActionDialogProps } from "./confirm-action-dialog";
import { MachineRow, type MachineAction } from "./machine-row";
import { useTranslation } from "~/client/lib/i18n";

/** Kept after closing so the dialog can animate out with its content intact. */
type Confirmation = { action: Exclude<MachineAction, "rotate">; agentId: string; machineName: string; open: boolean };

type ActionDialog = Omit<ConfirmActionDialogProps, "open" | "onOpenChange" | "returnFocusRef"> & { reset: () => void };

export function MachinesSection() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

	const agentsQuery = useSuspenseQuery({
		...listAgentsOptions(),
		refetchInterval: 5_000,
		refetchIntervalInBackground: false,
	});

	const remoteCount = agentsQuery.data.filter((agent) => agent.kind === "remote").length;

	const connectButtonRef = useRef<HTMLButtonElement>(null);
	const returnFocusRef = useRef<HTMLElement | null>(null);

	const closeConfirmation = () => setConfirmation((current) => current && { ...current, open: false });

	const revokeCredential = useMutation({ ...revokeRemoteAgentTokenMutation(), onSuccess: closeConfirmation });

	const deleteMachine = useMutation({
		...deleteRemoteAgentMutation(),
		onSuccess: () => {
			returnFocusRef.current = connectButtonRef.current;
			closeConfirmation();
		},
	});

	const machineName = confirmation?.machineName ?? "";
	const path = { agentId: confirmation?.agentId ?? "" };

	const actionDialogs: Record<Exclude<MachineAction, "rotate">, ActionDialog> = {
		revoke: {
			title: t("settings.machinesSection.revoke", { machineName: machineName }),
			description: t("settings.machinesSection.thisMachineWillDisconnect"),
			confirmLabel: "Revoke",
			variant: "destructive",
			pending: revokeCredential.isPending,
			error: revokeCredential.isError
				? revokeCredential.error?.message || "Could not revoke the connection. Try again."
				: null,
			onConfirm: () => revokeCredential.mutate({ path }),
			reset: revokeCredential.reset,
		},
		delete: {
			title: t("settings.machinesSection.delete", { machineName: machineName }),
			description: t("settings.machinesSection.thisMachineWillDisconnect2"),
			confirmLabel: "Delete machine",
			variant: "destructive",
			pending: deleteMachine.isPending,
			error: deleteMachine.isError
				? deleteMachine.error?.message || "Could not delete the machine. Try again."
				: null,
			onConfirm: () => deleteMachine.mutate({ path }),
			reset: deleteMachine.reset,
		},
	};

	const confirm = (action: Exclude<MachineAction, "rotate">, agentId: string, name: string) => {
		actionDialogs[action].reset();
		setConfirmation({ action, agentId, machineName: name, open: true });
	};

	return (
		<>
			<div className="space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm font-medium">
						{remoteCount === 0
							? t("settings.machinesSection.noRemoteMachines")
							: remoteCount === 1
								? t("settings.machinesSection.remoteMachine", { count: remoteCount })
								: t("settings.machinesSection.remoteMachines", { count: remoteCount })}
					</p>
					<Button
						ref={connectButtonRef}
						type="button"
						variant="primary"
						className="w-full sm:w-auto"
						onClick={() =>
							void navigate({ to: "/settings/machines/connect", search: { scope: "organization" } })
						}
					>
						<Plus className="mr-2 h-4 w-4" aria-hidden="true" />
						{t("breadcrumb.connectMachine")}
					</Button>
				</div>

				{agentsQuery.isError && (
					<Alert variant="destructive">
						<AlertContent>
							<AlertTitle>{t("settings.machinesSection.couldNotRefreshMachines")}</AlertTitle>
							<AlertDescription>{t("settings.machinesSection.showingTheLastKnown")}</AlertDescription>
						</AlertContent>
						<AlertAction>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => void agentsQuery.refetch()}
								loading={agentsQuery.isFetching}
							>
								<RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
								{t("settings.machinesSection.retry")}
							</Button>
						</AlertAction>
					</Alert>
				)}

				<ul
					className="min-w-0 divide-y overflow-hidden rounded-lg border"
					aria-label={t("settings.machinesSection.machines")}
				>
					{agentsQuery.data.map((agent) => (
						<MachineRow
							key={agent.id}
							agent={agent}
							onAction={(action, target, trigger) => {
								if (action === "rotate") {
									void navigate({
										to: "/settings/machines/connect",
										search: { agentId: target.id, scope: "organization" },
									});
									return;
								}
								returnFocusRef.current = trigger;
								confirm(action, target.id, getMachineDisplayName(target.name));
							}}
						/>
					))}
				</ul>
			</div>

			{confirmation && (
				<ConfirmActionDialog
					{...actionDialogs[confirmation.action]}
					open={confirmation.open}
					onOpenChange={(open) => !open && closeConfirmation()}
					returnFocusRef={returnFocusRef}
				/>
			)}
		</>
	);
}
