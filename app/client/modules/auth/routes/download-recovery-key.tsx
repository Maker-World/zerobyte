import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CheckCircle2, Download, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { downloadResticPasswordMutation } from "~/client/api-client/@tanstack/react-query.gen";
import { AuthLayout } from "~/client/components/auth-layout";
import { Alert, AlertDescription, AlertTitle } from "~/client/components/ui/alert";
import { Button, buttonVariants } from "~/client/components/ui/button";
import { Input } from "~/client/components/ui/input";
import { Label } from "~/client/components/ui/label";
import { downloadFile } from "~/client/lib/download";
import { ConfigImportForm } from "~/client/modules/auth/components/config-import-form";
import { parseError } from "~/client/lib/errors";
import {
	RECOVERY_KEY_DOWNLOAD_SKIPPED_COOKIE_MAX_AGE,
	RECOVERY_KEY_DOWNLOAD_SKIPPED_COOKIE_NAME,
} from "~/lib/recovery-key-skip";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	passwordAuthSupported: boolean;
	hasPassword: boolean;
	userId: string | null;
	runtime: "server" | "desktop";
};

export function DownloadRecoveryKeyPage({ passwordAuthSupported, hasPassword, userId, runtime }: Props) {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [password, setPassword] = useState("");
	const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
	const [importWarnings, setImportWarnings] = useState<string[] | null>(null);
	const isDesktopRuntime = runtime === "desktop";
	const goToVolumes = () => {
		void navigate({ to: "/volumes", replace: true });
	};

	const downloadResticPassword = useMutation({
		...downloadResticPasswordMutation(),
		onSuccess: (data) => {
			downloadFile({
				content: data,
				contentType: "text/plain",
				fileName: "restic.pass",
			});

			toast.success(t("recoveryKey.downloaded"));
			setBlockedMessage(null);
			goToVolumes();
		},
		onError: (error) => {
			const message = parseError(error)?.message;
			setBlockedMessage(message?.includes("local password") ? message : null);
			toast.error(t("recoveryKey.downloadFailed"), { description: message });
		},
	});

	const handleSubmit = (event: React.SubmitEvent) => {
		event.preventDefault();

		if (passwordAuthSupported && !password) {
			toast.error(t("auth.passwordRequired"));
			return;
		}

		setBlockedMessage(null);
		const accountPassword = passwordAuthSupported ? password : "";
		downloadResticPassword.mutate({
			body: { password: accountPassword },
		});
	};

	const handleSkip = () => {
		if (!userId) return;

		document.cookie = `${RECOVERY_KEY_DOWNLOAD_SKIPPED_COOKIE_NAME}=${userId}; path=/; max-age=${RECOVERY_KEY_DOWNLOAD_SKIPPED_COOKIE_MAX_AGE}`;
		goToVolumes();
	};

	if (importWarnings !== null) {
		const hasWarnings = importWarnings.length > 0;
		const description = hasWarnings ? t("configImport.result.needsAttention") : t("configImport.result.ready");
		const alertVariant = hasWarnings ? "warning" : "success";
		const alertTitle = hasWarnings ? t("configImport.result.reviewRequired") : t("configImport.result.complete");
		const continueLabel = hasWarnings ? t("configImport.result.understandContinue") : t("common.continue");

		return (
			<AuthLayout title={t("configImport.result.title")} description={description}>
				<div className="space-y-6">
					<Alert variant={alertVariant}>
						{hasWarnings ? <AlertTriangle className="size-5" /> : <CheckCircle2 className="size-5" />}
						<AlertTitle>{alertTitle}</AlertTitle>
						<AlertDescription className="space-y-3">
							{hasWarnings ? (
								<>
									<p>{t("configImport.result.warningsIntro")}</p>
									<ul className="list-disc space-y-2 break-words pl-5">
										{importWarnings.map((warning) => (
											<li key={warning}>{warning}</li>
										))}
									</ul>
									<p>{t("configImport.result.schedulesDisabled")}</p>
								</>
							) : (
								<p>{t("configImport.result.imported")}</p>
							)}
						</AlertDescription>
					</Alert>

					<Button variant="primary" className="w-full" onClick={goToVolumes}>
						{continueLabel}
						<ArrowRight className="ml-2 size-4" />
					</Button>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout title={t("recoveryKey.pageTitle")} description={t("recoveryKey.pageDescription")}>
			{isDesktopRuntime && (
				<Alert variant="warning" className="mb-3">
					<AlertTriangle className="size-5" />
					<AlertTitle>Zerobyte</AlertTitle>
					<AlertDescription>{t("recoveryKey.desktopAlpha")}</AlertDescription>
				</Alert>
			)}
			<Alert variant="warning" className="mb-6">
				<AlertTriangle className="size-5" />
				<AlertTitle>{t("recoveryKey.saveSecurelyTitle")}</AlertTitle>
				<AlertDescription>{t("recoveryKey.saveSecurelyDescription")}</AlertDescription>
			</Alert>

			<form onSubmit={handleSubmit} className="space-y-4">
				{passwordAuthSupported && (!hasPassword || blockedMessage) && (
					<Alert variant="warning">
						<AlertTriangle className="size-5" />
						<AlertTitle>{t("recoveryKey.localPasswordRequired")}</AlertTitle>
						<AlertDescription>
							{blockedMessage ?? t("recoveryKey.localPasswordRequiredMessage")}
						</AlertDescription>
					</Alert>
				)}

				{passwordAuthSupported && hasPassword && (
					<div className="space-y-2">
						<Label htmlFor="password">{t("recoveryKey.confirmPassword")}</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							placeholder={t("recoveryKey.passwordPlaceholder")}
							required
							disabled={downloadResticPassword.isPending}
						/>
						<p className="text-xs text-muted-foreground">{t("recoveryKey.passwordHint")}</p>
					</div>
				)}

				<div className="flex flex-col gap-2">
					{(!passwordAuthSupported || hasPassword) && (
						<Button type="submit" loading={downloadResticPassword.isPending} className="w-full">
							<Download size={16} className="mr-2" />
							{t("recoveryKey.download")}
						</Button>
					)}
					<Button
						type="button"
						variant="ghost"
						onClick={handleSkip}
						disabled={downloadResticPassword.isPending}
						className="w-full"
					>
						{t("common.skip")}
					</Button>
				</div>
			</form>

			<div className="my-6 border-t border-border/60" />

			<details>
				<summary className={buttonVariants({ variant: "link", className: "list-none px-0" })}>
					<Upload className="mr-2 size-4" />
					{t("configImport.importConfiguration")}
				</summary>
				<div className="mt-6">
					<ConfigImportForm onSuccess={setImportWarnings} />
				</div>
			</details>
		</AuthLayout>
	);
}
