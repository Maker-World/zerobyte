import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { SecretInput } from "~/client/components/ui/secret-input";
import type { NotificationFormValues } from "../create-notification-form";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

export const TelegramForm = ({ form }: Props) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="botToken"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.telegramForm.botToken")}</FormLabel>
						<FormControl>
							<SecretInput
								{...field}
								placeholder={t("notifications.telegramForm.n123456789AbcDef1234ghiklZyx57w2v1u123ew11")}
							/>
						</FormControl>
						<FormDescription>{t("notifications.telegramForm.telegramBotTokenGet")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="chatId"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.telegramForm.chatId")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder="-1231234567890" />
						</FormControl>
						<FormDescription>{t("notifications.telegramForm.telegramChatIdTo")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="threadId"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.discordForm.threadIdOptional")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder="3" />
						</FormControl>
						<FormDescription>{t("notifications.telegramForm.telegramGroupTopicId")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
