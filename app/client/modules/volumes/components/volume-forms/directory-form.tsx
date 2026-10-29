import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "../create-volume-form";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../../components/ui/form";
import { FolderSelector } from "~/client/components/folder-selector";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<FormValues>;
};

export const DirectoryForm = ({ form }: Props) => {
	const { t } = useTranslation();
	return (
		<FormField
			control={form.control}
			name="path"
			render={({ field }) => (
				<FormItem>
					<FormLabel>{t("volumes.info.directoryPath")}</FormLabel>
					<FormControl>
						<FolderSelector value={field.value ?? ""} onChange={field.onChange} />
					</FormControl>
					<FormDescription>{t("volumes.directoryForm.browseAndSelectA")}</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
