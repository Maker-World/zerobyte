import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import type { NotificationFormValues } from "../create-notification-form";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

export const CustomForm = ({ form }: Props) => {
	const { t } = useTranslation();
	return (
		<FormField
			control={form.control}
			name="shoutrrrUrl"
			render={({ field }) => (
				<FormItem>
					<FormLabel>{t("notifications.customForm.shoutrrrUrl")}</FormLabel>
					<FormControl>
						<Input {...field} placeholder={t("notifications.customForm.smtpUserPassSmtp")} />
					</FormControl>
					<FormDescription>
						{t("notifications.customForm.directShoutrrrUrlFor")}
						<a
							href="https://shoutrrr.nickfedor.com/latest/services/overview/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-strong-accent hover:underline"
						>
							{t("notifications.customForm.shoutrrrDocumentation")}
						</a>
						{t("notifications.customForm.forSupportedServicesAnd")}
					</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
