import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useTranslation } from "~/client/lib/i18n";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const { t } = useTranslation();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative rounded-full h-7 w-7 text-muted-foreground hover:text-foreground"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					aria-label={t("common.toggleTheme")}
				>
					<Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				</Button>
			</TooltipTrigger>
			<TooltipContent>{t("common.toggleTheme")}</TooltipContent>
		</Tooltip>
	);
}
