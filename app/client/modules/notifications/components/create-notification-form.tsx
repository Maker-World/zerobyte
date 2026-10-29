import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { cn } from "~/client/lib/utils";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import {
	customNotificationConfigSchema,
	discordNotificationConfigSchema,
	emailNotificationConfigSchema,
	genericNotificationConfigSchema,
	gotifyNotificationConfigSchema,
	ntfyNotificationConfigSchema,
	pushoverNotificationConfigSchema,
	slackNotificationConfigSchema,
	telegramNotificationConfigSchema,
} from "~/schemas/notifications";
import { useScrollToFormError } from "~/client/hooks/use-scroll-to-form-error";
import {
	CustomForm,
	DiscordForm,
	EmailForm,
	GenericForm,
	GotifyForm,
	NtfyForm,
	PushoverForm,
	SlackForm,
	TelegramForm,
} from "./notification-forms";
import { useTranslation } from "~/client/lib/i18n";

const baseFields = { name: z.string().min(2).max(32) };

const formSchema = z.discriminatedUnion("type", [
	emailNotificationConfigSchema.extend(baseFields),
	slackNotificationConfigSchema.extend(baseFields),
	discordNotificationConfigSchema.extend(baseFields),
	gotifyNotificationConfigSchema.extend(baseFields),
	ntfyNotificationConfigSchema.extend(baseFields),
	pushoverNotificationConfigSchema.extend(baseFields),
	telegramNotificationConfigSchema.extend(baseFields),
	genericNotificationConfigSchema.extend(baseFields),
	customNotificationConfigSchema.extend(baseFields),
]);

export type NotificationFormValues = z.input<typeof formSchema>;

type Props = {
	onSubmit: (values: NotificationFormValues) => void;
	mode?: "create" | "update";
	initialValues?: Partial<NotificationFormValues>;
	formId?: string;
	className?: string;
};

const defaultValuesForType = {
	email: {
		type: "email" as const,
		smtpHost: "",
		smtpPort: 587,
		username: "",
		password: "",
		from: "",
		to: [],
		useTLS: true,
	},
	slack: {
		type: "slack" as const,
		webhookUrl: "",
		username: "",
		iconEmoji: "",
	},
	discord: {
		type: "discord" as const,
		webhookUrl: "",
	},
	gotify: {
		type: "gotify" as const,
		serverUrl: "",
		token: "",
		priority: 5,
	},
	ntfy: {
		type: "ntfy" as const,
		topic: "",
		priority: "default" as const,
	},
	pushover: {
		type: "pushover" as const,
		userKey: "",
		apiToken: "",
		priority: 0 as const,
	},
	telegram: {
		type: "telegram" as const,
		botToken: "",
		chatId: "",
		threadId: "",
	},
	generic: {
		type: "generic" as const,
		url: "",
		method: "POST" as const,
		contentType: "application/json",
		headers: [],
		useJson: true,
		titleKey: "title",
		messageKey: "message",
	},
	custom: {
		type: "custom" as const,
		shoutrrrUrl: "",
	},
};

export const CreateNotificationForm = ({ onSubmit, mode = "create", initialValues, formId, className }: Props) => {
	const { t } = useTranslation();
	const form = useForm<NotificationFormValues>({
		resolver: zodResolver(formSchema, undefined, { raw: true }),
		defaultValues: initialValues || {
			name: "",
		},
		resetOptions: {
			keepDefaultValues: false,
			keepDirtyValues: false,
		},
	});

	const scrollToFirstError = useScrollToFormError();
	const watchedType = useWatch({ control: form.control, name: "type" });

	return (
		<Form {...form}>
			<form
				id={formId}
				onSubmit={form.handleSubmit(onSubmit, scrollToFirstError)}
				className={cn("space-y-4", className)}
			>
				<fieldset className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("common.name")}</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder={t("notifications.createNotificationForm.myNotification")}
										max={32}
										min={2}
									/>
								</FormControl>
								<FormDescription>
									{t("notifications.createNotificationForm.uniqueIdentifierForThis")}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("common.type")}</FormLabel>
								<Select
									onValueChange={(value) => {
										field.onChange(value);
										if (!initialValues) {
											form.reset({
												name: form.getValues().name || "",
												...defaultValuesForType[value as keyof typeof defaultValuesForType],
											});
										}
									}}
									value={field.value ?? ""}
									disabled={mode === "update"}
								>
									<FormControl>
										<SelectTrigger className={mode === "update" ? "bg-gray-50" : ""}>
											<SelectValue
												placeholder={t(
													"notifications.createNotificationForm.selectNotificationType",
												)}
											/>
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="email">
											{t("notifications.createNotificationForm.emailSmtp")}
										</SelectItem>
										<SelectItem value="slack">Slack</SelectItem>
										<SelectItem value="discord">Discord</SelectItem>
										<SelectItem value="gotify">Gotify</SelectItem>
										<SelectItem value="ntfy">Ntfy</SelectItem>
										<SelectItem value="pushover">Pushover</SelectItem>
										<SelectItem value="telegram">Telegram</SelectItem>
										<SelectItem value="generic">
											{t("notifications.createNotificationForm.genericWebhook")}
										</SelectItem>
										<SelectItem value="custom">
											{t("notifications.createNotificationForm.customShoutrrrUrl")}
										</SelectItem>
									</SelectContent>
								</Select>
								<FormDescription>
									{t("notifications.createNotificationForm.chooseTheNotificationDelivery")}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{watchedType === "email" && <EmailForm form={form} />}
					{watchedType === "slack" && <SlackForm form={form} />}
					{watchedType === "discord" && <DiscordForm form={form} />}
					{watchedType === "gotify" && <GotifyForm form={form} />}
					{watchedType === "ntfy" && <NtfyForm form={form} />}
					{watchedType === "pushover" && <PushoverForm form={form} />}
					{watchedType === "telegram" && <TelegramForm form={form} />}
					{watchedType === "generic" && <GenericForm form={form} />}
					{watchedType === "custom" && <CustomForm form={form} />}
				</fieldset>
			</form>
		</Form>
	);
};
