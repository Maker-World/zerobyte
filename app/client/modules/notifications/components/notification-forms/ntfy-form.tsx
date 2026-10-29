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

export const NtfyForm = ({ form }: Props) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="serverUrl"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.ntfyForm.serverUrlOptional")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder="https://ntfy.example.com" />
						</FormControl>
						<FormDescription>{t("notifications.ntfyForm.leaveEmptyToUse")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="topic"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.ntfyForm.topic")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder="zerobyte-backups" />
						</FormControl>
						<FormDescription>{t("notifications.ntfyForm.theNtfyTopicName")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="username"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.webdavForm.usernameOptional")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder="username" />
						</FormControl>
						<FormDescription>{t("notifications.ntfyForm.usernameForServerAuthentication")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="password"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.sftpForm.passwordOptional")}</FormLabel>
						<FormControl>
							<SecretInput {...field} placeholder="••••••••" />
						</FormControl>
						<FormDescription>{t("notifications.ntfyForm.passwordForServerAuthentication")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="accessToken"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.ntfyForm.accessTokenOptional")}</FormLabel>
						<FormControl>
							<SecretInput {...field} placeholder="••••••••" />
						</FormControl>
						<FormDescription>{t("notifications.ntfyForm.accessTokenForServer")}</FormDescription>
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
						<Select onValueChange={field.onChange} value={String(field.value)}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t("notifications.ntfyForm.selectPriority")} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="max">{t("notifications.ntfyForm.max5")}</SelectItem>
								<SelectItem value="high">{t("notifications.ntfyForm.high4")}</SelectItem>
								<SelectItem value="default">{t("notifications.ntfyForm.default3")}</SelectItem>
								<SelectItem value="low">{t("notifications.ntfyForm.low2")}</SelectItem>
								<SelectItem value="min">{t("notifications.ntfyForm.min1")}</SelectItem>
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
