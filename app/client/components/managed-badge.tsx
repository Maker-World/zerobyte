import { Badge } from "~/client/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/client/components/ui/tooltip";
import { useTranslation } from "~/client/lib/i18n";

type ManagedBadgeProps = {
	label?: string;
	message?: string;
};

export const ManagedBadge = ({ label, message }: ManagedBadgeProps) => {
	const { t } = useTranslation();
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Badge variant="secondary">{label ?? t("repositories.repositoryDetails.managed")}</Badge>
			</TooltipTrigger>
			<TooltipContent>
				<p className="max-w-80 text-sm">{message ?? t("components.managedBadge.defaultMessage")}</p>
			</TooltipContent>
		</Tooltip>
	);
};
