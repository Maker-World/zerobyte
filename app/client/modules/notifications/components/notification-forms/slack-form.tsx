import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import type { NotificationFormValues } from "../create-notification-form";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

export const SlackForm = ({ form }: Props) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="webhookUrl"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.discordForm.webhookUrl")}</FormLabel>
						<FormControl>
							<Input
								{...field}
								placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX"
							/>
						</FormControl>
						<FormDescription>{t("notifications.slackForm.getThisFromYour")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="username"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.discordForm.botUsernameOptional")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder="Zerobyte" />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="iconEmoji"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.slackForm.iconEmojiOptional")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder=":floppy_disk:" />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
