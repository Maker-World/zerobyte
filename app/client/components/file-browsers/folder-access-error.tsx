import { toast } from "sonner";
import { FileWarning } from "lucide-react";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	message: string;
	openPrivacySettings?: () => Promise<void>;
};

export const FolderAccessError = ({ message, openPrivacySettings }: Props) => {
	const { t } = useTranslation();
	const denied = /\b(EPERM|EACCES)\b/.test(message);

	return (
		<div role="alert" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-destructive">
			<FileWarning className="size-4 shrink-0" aria-hidden="true" />
			<span>{denied ? t("components.folderAccessError.accessToThisFolder") : message}</span>
			{denied && openPrivacySettings && (
				<button
					type="button"
					className="cursor-pointer text-xs underline underline-offset-2 normal-case"
					onClick={() =>
						void openPrivacySettings().catch(() =>
							toast.error(t("components.folderAccessError.couldNotOpenPrivacy")),
						)
					}
				>
					{t("components.folderAccessError.openPrivacySettings")}
				</button>
			)}
		</div>
	);
};
