import { cn } from "~/client/lib/utils";
import { Switch } from "./ui/switch";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	isOn: boolean;
	toggle: (v: boolean) => void;
	enabledLabel: string;
	disabledLabel: string;
	disabled?: boolean;
};

export const OnOff = ({ isOn, toggle, enabledLabel, disabledLabel, disabled }: Props) => {
	const { t } = useTranslation();
	return (
		<div
			className={cn(
				"flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
				isOn
					? "border-success/30 bg-success/10 text-success"
					: "border-muted bg-muted/40 text-muted-foreground dark:border-muted/60 dark:bg-muted/10",
			)}
		>
			<span>{isOn ? enabledLabel : disabledLabel}</span>
			<Switch
				disabled={disabled}
				checked={isOn}
				onCheckedChange={toggle}
				aria-label={
					isOn
						? t("components.onoff.toggle", { enabledLabel: enabledLabel })
						: t("components.onoff.toggle2", { disabledLabel: disabledLabel })
				}
			/>
		</div>
	);
};
