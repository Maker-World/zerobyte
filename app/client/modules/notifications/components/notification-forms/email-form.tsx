import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { SecretInput } from "~/client/components/ui/secret-input";
import { Checkbox } from "~/client/components/ui/checkbox";
import type { NotificationFormValues } from "../create-notification-form";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

export const EmailForm = ({ form }: Props) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="smtpHost"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.emailForm.smtpHost")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder="smtp.example.com" />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="smtpPort"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.emailForm.smtpPort")}</FormLabel>
						<FormControl>
							<Input
								{...field}
								type="number"
								placeholder="587"
								onChange={(e) => field.onChange(Number(e.target.value))}
							/>
						</FormControl>
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
							<Input {...field} placeholder={t("notifications.emailForm.userExampleCom")} />
						</FormControl>
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
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="from"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.emailForm.fromAddress")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.emailForm.noreplyExampleCom")} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="fromName"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.emailForm.fromNameOptional")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.emailForm.zerobyteBackup")} />
						</FormControl>
						<FormDescription>{t("notifications.emailForm.theDisplayNameShown")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="to"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.emailForm.toAddresses")}</FormLabel>
						<FormControl>
							<Input
								{...field}
								placeholder={t("notifications.emailForm.userExampleComAdmin")}
								value={Array.isArray(field.value) ? field.value.join(", ") : ""}
								onChange={(e) =>
									field.onChange(
										e.target.value
											.split(",")
											.map((email) => email.trim())
											.filter(Boolean),
									)
								}
							/>
						</FormControl>
						<FormDescription>{t("notifications.emailForm.commaSeparatedListOf")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="useTLS"
				render={({ field }) => (
					<FormItem className="flex flex-row items-center space-x-3">
						<FormControl>
							<Checkbox checked={field.value} onCheckedChange={field.onChange} />
						</FormControl>
						<div className="space-y-1 leading-none">
							<FormLabel>{t("notifications.emailForm.useTls")}</FormLabel>
							<FormDescription>{t("notifications.emailForm.enableTlsEncryptionFor")}</FormDescription>
						</div>
					</FormItem>
				)}
			/>
		</>
	);
};
