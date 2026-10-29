import { StatusDot } from "~/client/components/status-dot";
import { useTranslation } from "~/client/lib/i18n";

export const BackupStatusDot = ({
	enabled,
	hasError,
	hasWarning,
	isInProgress,
}: {
	enabled: boolean;
	hasError?: boolean;
	hasWarning?: boolean;
	isInProgress?: boolean;
}) => {
	const { t } = useTranslation();
	let variant: "success" | "neutral" | "error" | "warning" | "info";
	let label: string;

	if (isInProgress) {
		variant = "info";
		label = t("backups.status.inProgress");
	} else if (hasError) {
		variant = "error";
		label = t("status.error");
	} else if (hasWarning) {
		variant = "warning";
		label = t("status.warning");
	} else if (enabled) {
		variant = "success";
		label = t("status.active");
	} else {
		variant = "neutral";
		label = t("status.paused");
	}

	return <StatusDot variant={variant} label={label} />;
};
