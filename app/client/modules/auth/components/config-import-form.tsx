import { parseError } from "~/client/lib/errors";
import { useMutation } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { importConfigMutation } from "~/client/api-client/@tanstack/react-query.gen";
import { Button } from "~/client/components/ui/button";
import { Input } from "~/client/components/ui/input";
import { Label } from "~/client/components/ui/label";
import { SecretInput } from "~/client/components/ui/secret-input";
import {
	CONFIG_TRANSFER_MAX_FILE_BYTES,
	CONFIG_TRANSFER_PASSPHRASE_MAX_LENGTH,
	CONFIG_TRANSFER_PASSPHRASE_MIN_LENGTH,
} from "~/lib/config-transfer";
import { useTranslation } from "~/client/lib/i18n";

type ConfigImportFormProps = {
	onSuccess: (warnings: string[]) => void;
};

export function ConfigImportForm({ onSuccess }: ConfigImportFormProps) {
	const { t } = useTranslation();
	const [importFile, setImportFile] = useState<File | null>(null);
	const [exportPassphrase, setExportPassphrase] = useState("");
	const importConfig = useMutation({
		...importConfigMutation(),
		onSuccess: (data) => {
			onSuccess(data.warnings);
		},
		onError: (error) => {
			toast.error(t("configImport.failed"), { description: parseError(error)?.message });
		},
	});

	const handleSubmit = async (event: React.SubmitEvent) => {
		event.preventDefault();

		if (!importFile) {
			toast.error(t("configImport.fileRequired"));
			return;
		}

		if (importFile.size > CONFIG_TRANSFER_MAX_FILE_BYTES) {
			toast.error(t("configImport.fileTooLarge"));
			return;
		}

		if (exportPassphrase.length < CONFIG_TRANSFER_PASSPHRASE_MIN_LENGTH) {
			toast.error(t("configImport.passphraseMin", { min: CONFIG_TRANSFER_PASSPHRASE_MIN_LENGTH }));
			return;
		}

		const encryptedConfig = await importFile.text();
		importConfig.mutate({
			body: {
				encryptedConfig,
				exportPassphrase,
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-1">
				<h2 className="text-sm font-medium">{t("configImport.title")}</h2>
				<p className="text-xs text-muted-foreground">{t("configImport.description")}</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="config-file">{t("configImport.file")}</Label>
				<Input
					id="config-file"
					type="file"
					accept=".zbex"
					onChange={(event) => {
						const selectedFile = event.target.files?.[0] ?? null;
						setImportFile(selectedFile);
					}}
					disabled={importConfig.isPending}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="export-passphrase">{t("configImport.passphrase")}</Label>
				<SecretInput
					id="export-passphrase"
					value={exportPassphrase}
					onChange={(event) => setExportPassphrase(event.target.value)}
					placeholder={t("configImport.passphrasePlaceholder")}
					autoComplete="off"
					minLength={CONFIG_TRANSFER_PASSPHRASE_MIN_LENGTH}
					maxLength={CONFIG_TRANSFER_PASSPHRASE_MAX_LENGTH}
					required
					disabled={importConfig.isPending}
				/>
				<p className="text-xs text-muted-foreground">{t("configImport.passphraseHint")}</p>
			</div>

			<Button type="submit" variant="outline" loading={importConfig.isPending} className="w-full">
				<Upload size={16} className="mr-2" />
				{t("configImport.import")}
			</Button>
		</form>
	);
}
