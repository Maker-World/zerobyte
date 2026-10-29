import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/client/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/client/components/ui/dialog";
import { Input } from "~/client/components/ui/input";
import { Label } from "~/client/components/ui/label";
import { authClient } from "~/client/lib/auth-client";
import { logger } from "~/client/lib/logger";
import { useTranslation } from "~/client/lib/i18n";

type TwoFactorDisableDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
};

export const TwoFactorDisableDialog = ({ open, onOpenChange, onSuccess }: TwoFactorDisableDialogProps) => {
	const { t } = useTranslation();
	const [password, setPassword] = useState("");
	const [isDisabling, setIsDisabling] = useState(false);

	const handleDisable = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!password) {
			toast.error(t("auth.passwordRequired"));
			return;
		}

		const { error } = await authClient.twoFactor.disable({
			password,
			fetchOptions: {
				onRequest: () => {
					setIsDisabling(true);
				},
				onResponse: () => {
					setIsDisabling(false);
				},
			},
		});

		if (error) {
			logger.error(error);
			toast.error(t("settings.twoFactorDisableDialog.failedToDisable2fa"), { description: error.message });
			return;
		}

		toast.success(t("settings.twoFactorDisableDialog.twoFactorAuthenticationDisabled"));
		handleClose();
		onSuccess();
	};

	const handleClose = () => {
		onOpenChange(false);
		setPassword("");
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<form onSubmit={handleDisable}>
					<DialogHeader>
						<DialogTitle>{t("settings.twoFactorDisableDialog.disableTwoFactorAuthentication")}</DialogTitle>
						<DialogDescription>{t("settings.twoFactorDisableDialog.areYouSureYou")}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="disable-password">{t("settings.backupCodesDialog.yourPassword")}</Label>
							<Input
								id="disable-password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder={t("recoveryKey.passwordPlaceholder")}
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleClose}>
							{t("common.cancel")}
						</Button>
						<Button type="submit" variant="destructive" loading={isDisabling}>
							{t("settings.twoFactorDisableDialog.disable2fa")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
