import { Download } from "lucide-react";
import { CardContent, CardDescription, CardTitle } from "~/client/components/ui/card";
import { ConfigExportDialog } from "./config-export-dialog";
import { RecoveryKeyDownloadDialog } from "./recovery-key-download-dialog";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	passwordAuthSupported: boolean;
	hasPassword: boolean;
};

export function RecoveryKeySection({ passwordAuthSupported, hasPassword }: Props) {
	const { t } = useTranslation();
	return (
		<>
			<div className="border-b border-border/50 bg-card-header p-6">
				<CardTitle className="flex items-center gap-2">
					<Download className="size-5" />
					{t("settings.recoveryKeySection.backupRecoveryKey")}
				</CardTitle>
				<CardDescription className="mt-1.5">
					{t("settings.recoveryKeySection.downloadTheRecoveryKey")}
				</CardDescription>
			</div>
			<CardContent className="p-6 space-y-4">
				<p className="text-sm text-muted-foreground max-w-2xl">
					{t("settings.recoveryKeySection.thisFileContainsThe")}
				</p>
				<RecoveryKeyDownloadDialog passwordAuthSupported={passwordAuthSupported} hasPassword={hasPassword} />
				<div className="space-y-2 pt-2">
					<p className="text-sm text-muted-foreground max-w-2xl">
						{t("settings.recoveryKeySection.downloadAnEncryptedExport")}
					</p>
					<ConfigExportDialog hasPassword={hasPassword} passwordAuthSupported={passwordAuthSupported} />
				</div>
			</CardContent>
		</>
	);
}
