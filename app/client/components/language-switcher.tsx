import { Languages } from "lucide-react";
import { isLanguage, LANGUAGES, languageLabels, useTranslation } from "~/client/lib/i18n";
import { cn } from "~/client/lib/utils";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Props = {
	className?: string;
};

export function LanguageSwitcher({ className }: Props) {
	const { t, language, setLanguage } = useTranslation();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn("rounded-full h-7 w-7 text-muted-foreground hover:text-foreground", className)}
					aria-label={t("common.changeLanguage")}
					title={t("common.changeLanguage")}
				>
					<Languages className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuRadioGroup
					value={language}
					onValueChange={(value) => {
						if (isLanguage(value)) setLanguage(value);
					}}
				>
					{LANGUAGES.map((item) => (
						<DropdownMenuRadioItem key={item} value={item} lang={item}>
							{languageLabels[item]}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
