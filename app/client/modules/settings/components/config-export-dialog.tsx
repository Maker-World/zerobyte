import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { exportConfigMutation } from "~/client/api-client/@tanstack/react-query.gen";
import { Button } from "~/client/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/client/components/ui/alert";
import { Label } from "~/client/components/ui/label";
import { SecretInput } from "~/client/components/ui/secret-input";
import { downloadFile } from "~/client/lib/download";
import { PasswordProtectedActionDialog } from "~/client/modules/settings/components/password-protected-action-dialog";
import { CONFIG_TRANSFER_PASSPHRASE_MAX_LENGTH, CONFIG_TRANSFER_PASSPHRASE_MIN_LENGTH } from "~/lib/config-transfer";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	hasPassword: boolean;
	passwordAuthSupported: boolean;
};

export function ConfigExportDialog({ hasPassword, passwordAuthSupported }: Props) {
	const { t } = useTranslation();
	const [exportPassphrase, setExportPassphrase] = useState("");
	const [exportPassphraseConfirmation, setExportPassphraseConfirmation] = useState("");
	const exportConfiguration = useMutation(exportConfigMutation());

	const resetExportPassphrase = () => {
		setExportPassphrase("");
		setExportPassphraseConfirmation("");
	};

	const generatePassphrase = () => {
		setExportPassphrase(crypto.randomUUID().replaceAll("-", ""));
		setExportPassphraseConfirmation("");
		toast.info(t("settings.configExportDialog.strongPassphraseGenerated"), {
			description: t("settings.configExportDialog.saveItSomewhereSafe"),
		});
	};

	const validateExport = () => {
		if (exportPassphrase.length < CONFIG_TRANSFER_PASSPHRASE_MIN_LENGTH) {
			toast.error(
				t("settings.configExportDialog.exportPassphraseMustBe", {
					CONFIG_TRANSFER_PASSPHRASE_MIN_LENGTH: CONFIG_TRANSFER_PASSPHRASE_MIN_LENGTH,
				}),
			);
			return false;
		}
		if (exportPassphrase !== exportPassphraseConfirmation) {
			toast.error(t("settings.configExportDialog.exportPassphrasesDoNot"));
			return false;
		}

		return true;
	};

	const handleExport = async (password: string) => {
		const content = await exportConfiguration.mutateAsync({
			body: {
				password,
				exportPassphrase,
			},
		});
		downloadFile({ content, contentType: "text/plain", fileName: "zerobyte-config.zbex" });
		toast.success(t("settings.configExportDialog.encryptedConfigurationExportedSuccessfully"));
	};
	const action = {
		title: t("settings.configExportDialog.exportEncryptedConfiguration"),
		description: t("settings.configExportDialog.exportAConfigurationFile"),
		trigger: (
			<Button variant="outline">
				<Download className="mr-2 size-4" />
				{t("settings.configExportDialog.exportEncryptedConfig")}
			</Button>
		),
		submitLabel: "Export",
		submitIcon: <Download className="mr-2 size-4" />,
		isPending: exportConfiguration.isPending,
		failureMessage: t("settings.configExportDialog.failedToExportConfiguration"),
		onSubmit: handleExport,
	};

	return (
		<PasswordProtectedActionDialog
			hasPassword={hasPassword}
			passwordAuthSupported={passwordAuthSupported}
			action={action}
			validateAction={validateExport}
			onClose={resetExportPassphrase}
		>
			<div className="space-y-4">
				<Alert variant="warning">
					<AlertTriangle className="size-5" />
					<AlertTitle>{t("settings.configExportDialog.configurationOnly")}</AlertTitle>
					<AlertDescription>{t("settings.configExportDialog.thisExportDoesNot")}</AlertDescription>
				</Alert>

				<div className="space-y-2">
					<div className="flex items-center justify-between gap-2">
						<Label htmlFor="config-export-passphrase">{t("configImport.passphrase")}</Label>
						<Button type="button" variant="outline" size="sm" onClick={generatePassphrase}>
							{t("settings.configExportDialog.generateStrongPassphrase")}
						</Button>
					</div>
					<SecretInput
						id="config-export-passphrase"
						value={exportPassphrase}
						onChange={(event) => setExportPassphrase(event.target.value)}
						placeholder={t("settings.configExportDialog.atLeastCharacters", {
							CONFIG_TRANSFER_PASSPHRASE_MIN_LENGTH: CONFIG_TRANSFER_PASSPHRASE_MIN_LENGTH,
						})}
						autoComplete="new-password"
						minLength={CONFIG_TRANSFER_PASSPHRASE_MIN_LENGTH}
						maxLength={CONFIG_TRANSFER_PASSPHRASE_MAX_LENGTH}
						required
					/>
					<p className="text-xs text-muted-foreground">{t("settings.configExportDialog.youWillNeedThis")}</p>
				</div>
				<div className="space-y-2">
					<Label htmlFor="config-export-passphrase-confirmation">
						{t("settings.configExportDialog.confirmExportPassphrase")}
					</Label>
					<SecretInput
						id="config-export-passphrase-confirmation"
						value={exportPassphraseConfirmation}
						onChange={(event) => setExportPassphraseConfirmation(event.target.value)}
						autoComplete="new-password"
						minLength={CONFIG_TRANSFER_PASSPHRASE_MIN_LENGTH}
						maxLength={CONFIG_TRANSFER_PASSPHRASE_MAX_LENGTH}
						required
					/>
				</div>
			</div>
		</PasswordProtectedActionDialog>
	);
}
