import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { SecretInput } from "~/client/components/ui/secret-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import type { NotificationFormValues } from "../create-notification-form";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

export const PushoverForm = ({ form }: Props) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="userKey"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.pushoverForm.userKey")}</FormLabel>
						<FormControl>
							<Input
								{...field}
								placeholder={t("notifications.pushoverForm.uqirzpo4dxghdmr9qzzfqu27cmvrsg")}
							/>
						</FormControl>
						<FormDescription>{t("notifications.pushoverForm.yourPushoverUserKey")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="apiToken"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.pushoverForm.apiToken")}</FormLabel>
						<FormControl>
							<SecretInput {...field} placeholder="••••••••" />
						</FormControl>
						<FormDescription>{t("notifications.pushoverForm.applicationApiTokenFrom")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="devices"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.pushoverForm.devicesOptional")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.pushoverForm.iphoneAndroid")} />
						</FormControl>
						<FormDescription>{t("notifications.pushoverForm.commaSeparatedListOf")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="priority"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.gotifyForm.priority")}</FormLabel>
						<Select
							onValueChange={(value) => field.onChange(Number(value))}
							defaultValue={String(field.value)}
							value={String(field.value)}
						>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t("notifications.ntfyForm.selectPriority")} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="-1">{t("notifications.pushoverForm.low1")}</SelectItem>
								<SelectItem value="0">{t("notifications.pushoverForm.normal0")}</SelectItem>
								<SelectItem value="1">{t("notifications.pushoverForm.high1")}</SelectItem>
							</SelectContent>
						</Select>
						<FormDescription>{t("notifications.pushoverForm.messagePriorityLevel")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
