import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { SecretInput } from "~/client/components/ui/secret-input";
import type { NotificationFormValues } from "../create-notification-form";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

export const GotifyForm = ({ form }: Props) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="serverUrl"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.gotifyForm.serverUrl")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder="https://gotify.example.com" />
						</FormControl>
						<FormDescription>{t("notifications.gotifyForm.yourSelfHostedGotify")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="token"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.gotifyForm.appToken")}</FormLabel>
						<FormControl>
							<SecretInput {...field} placeholder="••••••••" />
						</FormControl>
						<FormDescription>{t("notifications.gotifyForm.applicationTokenFromGotify")}</FormDescription>
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
						<FormControl>
							<Input
								{...field}
								type="number"
								min={0}
								max={10}
								onChange={(e) => field.onChange(Number(e.target.value))}
							/>
						</FormControl>
						<FormDescription>{t("notifications.gotifyForm.priorityLevel010")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="path"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.gotifyForm.pathOptional")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder="/custom/path" />
						</FormControl>
						<FormDescription>{t("notifications.gotifyForm.customPathOnThe")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
