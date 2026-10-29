import { useWatch, type UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import { Checkbox } from "~/client/components/ui/checkbox";
import { Textarea } from "~/client/components/ui/textarea";
import { WebhookRequestPreview } from "~/client/components/webhook-request-preview";
import type { NotificationFormValues } from "../create-notification-form";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

const WebhookPreview = ({ values }: { values: Partial<NotificationFormValues> }) => {
	if (values.type !== "generic") return null;

	const contentType = values.contentType || "application/json";
	const headers = values.headers?.filter(Boolean) || [];
	const useJson = values.useJson;
	const titleKey = values.titleKey || "title";
	const messageKey = values.messageKey || "message";

	let body = "";
	if (useJson) {
		body = JSON.stringify(
			{
				[titleKey]: "Notification title",
				[messageKey]: "Notification message",
			},
			null,
			2,
		);
	} else {
		body = "Notification message";
	}

	return (
		<WebhookRequestPreview
			method={values.method || "POST"}
			url={values.url}
			contentType={contentType}
			headers={headers}
			body={body}
		/>
	);
};

export const GenericForm = ({ form }: Props) => {
	const { t } = useTranslation();
	const watchedValues = useWatch({ control: form.control });
	const useJson = useWatch({ control: form.control, name: "useJson" });

	return (
		<>
			<FormField
				control={form.control}
				name="url"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.discordForm.webhookUrl")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder="https://api.example.com/webhook" />
						</FormControl>
						<FormDescription>{t("notifications.genericForm.theTargetOriginMust")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="method"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.genericForm.method")}</FormLabel>
						<Select onValueChange={field.onChange} value={field.value ?? ""}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t("notifications.genericForm.selectMethod")} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="GET">GET</SelectItem>
								<SelectItem value="POST">POST</SelectItem>
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="contentType"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.genericForm.contentType")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder="application/json" />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="headers"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.genericForm.headers")}</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								placeholder={t("backups.advancedSection.authorizationBearerTokenX")}
								value={Array.isArray(field.value) ? field.value.join("\n") : ""}
								onChange={(e) =>
									field.onChange(
										e.target.value
											.split("\n")
											.map((header) => header.trim())
											.filter(Boolean),
									)
								}
							/>
						</FormControl>
						<FormDescription>{t("backups.advancedSection.oneHeaderPerLine")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="useJson"
				render={({ field }) => (
					<FormItem className="flex flex-row items-center space-x-3">
						<FormControl>
							<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked)} />
						</FormControl>
						<div className="space-y-1 leading-none">
							<FormLabel>{t("notifications.genericForm.useJsonTemplate")}</FormLabel>
							<FormDescription>{t("notifications.genericForm.sendTheMessageAs")}</FormDescription>
						</div>
					</FormItem>
				)}
			/>
			{useJson && (
				<>
					<FormField
						control={form.control}
						name="titleKey"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("notifications.genericForm.titleKey")}</FormLabel>
								<FormControl>
									<Input {...field} placeholder="title" />
								</FormControl>
								<FormDescription>{t("notifications.genericForm.theJsonKeyFor")}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="messageKey"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("notifications.genericForm.messageKey")}</FormLabel>
								<FormControl>
									<Input {...field} placeholder="message" />
								</FormControl>
								<FormDescription>{t("notifications.genericForm.theJsonKeyFor2")}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</>
			)}
			<WebhookPreview values={watchedValues} />
		</>
	);
};
