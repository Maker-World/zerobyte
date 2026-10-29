import { CheckCircle2, Plus } from "lucide-react";
import type { ListAgentsResponse } from "~/client/api-client/types.gen";
import { Alert, AlertDescription, AlertTitle } from "~/client/components/ui/alert";
import { Button } from "~/client/components/ui/button";
import { getMachineDisplayName } from "~/lib/machine-name";
import { MachineRow } from "./machine-row";
import { useTranslation } from "~/client/lib/i18n";

export function MachineConnectionSuccess({
	agent,
	onDone,
	onCreateSource,
}: {
	agent: ListAgentsResponse[number];
	onDone: () => void;
	onCreateSource: () => void;
}) {
	const { t } = useTranslation();
	const machineName = getMachineDisplayName(agent.name);

	return (
		<>
			<Alert variant="success">
				<CheckCircle2 aria-hidden="true" />
				<AlertTitle>
					{t("settings.machineConnectionSuccess.isConnected", { machineName: machineName })}
				</AlertTitle>
				<AlertDescription>{t("settings.machineConnectionSuccess.yourAgentIsOnline")}</AlertDescription>
			</Alert>
			<ul
				className="min-w-0 divide-y overflow-hidden rounded-lg border"
				aria-label={t("settings.machineConnectionSuccess.connectedMachine")}
			>
				<MachineRow agent={agent} />
			</ul>
			<div className="flex justify-end gap-2 pt-4 border-t">
				<Button variant="secondary" onClick={onDone}>
					{t("settings.apiKeysSection.done")}
				</Button>
				{agent.capabilities.trustedRoots.some((root) => root.canBackup) && (
					<Button onClick={onCreateSource}>
						<Plus className="h-4 w-4 mr-2" aria-hidden="true" />
						{t("settings.machineConnectionSuccess.createASource")}
					</Button>
				)}
			</div>
		</>
	);
}
