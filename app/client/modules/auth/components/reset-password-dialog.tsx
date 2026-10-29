import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/client/components/ui/dialog";
import { useTranslation } from "~/client/lib/i18n";

const RESET_PASSWORD_COMMAND = "docker exec -it zerobyte bun run cli reset-password";

type ResetPasswordDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export const ResetPasswordDialog = ({ open, onOpenChange }: ResetPasswordDialogProps) => {
	const { t } = useTranslation();
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>{t("auth.resetPassword.title")}</DialogTitle>
					<DialogDescription>{t("auth.resetPassword.description")}</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="rounded-md bg-muted p-4 font-mono text-sm break-all select-all">
						{RESET_PASSWORD_COMMAND}
					</div>
					<p className="text-sm text-muted-foreground">{t("auth.resetPassword.hint")}</p>
				</div>
			</DialogContent>
		</Dialog>
	);
};
