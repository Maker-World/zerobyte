import { AlertTriangle, X } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "~/client/components/ui/alert";
import { Button } from "~/client/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/client/components/ui/dialog";
import { Input } from "~/client/components/ui/input";
import { Label } from "~/client/components/ui/label";
import { parseError } from "~/client/lib/errors";
import { useTranslation } from "~/client/lib/i18n";

type PasswordProtectedAction = {
	title: string;
	description: string;
	trigger: ReactNode;
	submitLabel: string;
	submitIcon: ReactNode;
	isPending: boolean;
	failureMessage: string;
	onSubmit: (password: string) => Promise<void>;
};

type PasswordProtectedActionDialogProps = {
	hasPassword: boolean;
	passwordAuthSupported: boolean;
	action: PasswordProtectedAction;
	validateAction?: () => boolean;
	onClose?: () => void;
	children?: ReactNode;
};

export function PasswordProtectedActionDialog({
	hasPassword,
	passwordAuthSupported,
	action,
	validateAction,
	onClose,
	children,
}: PasswordProtectedActionDialogProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [accountPassword, setAccountPassword] = useState("");
	const passwordInputId = useId();
	const canPerformAction = !passwordAuthSupported || hasPassword;
	const requiresPassword = passwordAuthSupported && hasPassword;

	const close = () => {
		setOpen(false);
		setAccountPassword("");
		onClose?.();
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setOpen(true);
			return;
		}

		close();
	};

	const handleSubmit = async (event: React.SubmitEvent) => {
		event.preventDefault();
		if (requiresPassword && !accountPassword) {
			toast.error(t("auth.passwordRequired"));
			return;
		}

		let isActionValid = true;
		if (validateAction) {
			isActionValid = validateAction();
		}
		if (!isActionValid) {
			return;
		}

		const password = requiresPassword ? accountPassword : "";
		try {
			await action.onSubmit(password);
			close();
		} catch (error) {
			const errorMessage = parseError(error)?.message;
			toast.error(action.failureMessage, { description: errorMessage });
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{action.trigger}</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{action.title}</DialogTitle>
						<DialogDescription>{action.description}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						{passwordAuthSupported && !hasPassword && (
							<Alert variant="warning">
								<AlertTriangle className="size-5" />
								<AlertTitle>{t("recoveryKey.localPasswordRequired")}</AlertTitle>
								<AlertDescription>
									{t("settings.passwordProtectedActionDialog.localPasswordRequired")}
								</AlertDescription>
							</Alert>
						)}
						{requiresPassword && (
							<div className="space-y-2">
								<Label htmlFor={passwordInputId}>
									{t("settings.passwordProtectedActionDialog.yourPassword")}
								</Label>
								<Input
									id={passwordInputId}
									type="password"
									value={accountPassword}
									onChange={(event) => setAccountPassword(event.target.value)}
									placeholder={t("recoveryKey.passwordPlaceholder")}
									autoComplete="current-password"
									required
								/>
							</div>
						)}
						{canPerformAction && children}
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={close}>
							<X className="mr-2 size-4" />
							{t("common.cancel")}
						</Button>
						{canPerformAction && (
							<Button type="submit" loading={action.isPending}>
								{action.submitIcon}
								{action.submitLabel}
							</Button>
						)}
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
