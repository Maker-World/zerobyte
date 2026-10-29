import { useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "~/client/components/ui/button";
import { CardContent, CardDescription, CardTitle } from "~/client/components/ui/card";
import { TwoFactorSetupDialog } from "./two-factor-setup-dialog";
import { TwoFactorDisableDialog } from "./two-factor-disable-dialog";
import { BackupCodesDialog } from "./backup-codes-dialog";
import { useTranslation } from "~/client/lib/i18n";

type TwoFactorSectionProps = {
	twoFactorEnabled?: boolean | null;
};

export const TwoFactorSection = ({ twoFactorEnabled }: TwoFactorSectionProps) => {
	const { t } = useTranslation();
	const [setupDialogOpen, setSetupDialogOpen] = useState(false);
	const [disableDialogOpen, setDisableDialogOpen] = useState(false);
	const [backupCodesDialogOpen, setBackupCodesDialogOpen] = useState(false);

	const handleSuccess = async () => {
		window.location.reload();
	};

	return (
		<>
			<div className="border-t border-border/50 bg-card-header p-6">
				<CardTitle className="flex items-center gap-2">
					<Shield className="size-5" />
					{t("auth.twoFactorTitle")}
				</CardTitle>
				<CardDescription className="mt-1.5">{t("settings.twoFactorSection.addAnExtraLayer")}</CardDescription>
			</div>
			<CardContent className="p-6 space-y-4">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<p className="text-sm font-medium">
							{t("settings.twoFactorSection.status")}
							{twoFactorEnabled ? (
								<span className="text-success">{t("settings.twoFactorSection.enabled")}</span>
							) : (
								<span className="text-muted-foreground">{t("status.disabled")}</span>
							)}
						</p>
						<p className="text-xs text-muted-foreground max-w-xl">
							{t("settings.twoFactorSection.twoFactorAuthenticationAdds")}
						</p>
					</div>
					<div className="flex gap-2">
						{!twoFactorEnabled ? (
							<Button onClick={() => setSetupDialogOpen(true)}>
								{t("settings.twoFactorSection.enable2fa")}
							</Button>
						) : (
							<div className="ml-2 flex flex-col @xl:flex-row gap-2">
								<Button variant="outline" onClick={() => setBackupCodesDialogOpen(true)}>
									{t("settings.backupCodesDialog.backupCodes")}
								</Button>
								<Button variant="destructive" onClick={() => setDisableDialogOpen(true)}>
									{t("settings.twoFactorDisableDialog.disable2fa")}
								</Button>
							</div>
						)}
					</div>
				</div>
			</CardContent>

			<TwoFactorSetupDialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen} onSuccess={handleSuccess} />

			<TwoFactorDisableDialog
				open={disableDialogOpen}
				onOpenChange={setDisableDialogOpen}
				onSuccess={handleSuccess}
			/>

			<BackupCodesDialog open={backupCodesDialogOpen} onOpenChange={setBackupCodesDialogOpen} />
		</>
	);
};
