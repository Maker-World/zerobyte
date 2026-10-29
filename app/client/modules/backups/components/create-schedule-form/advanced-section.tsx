import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Textarea } from "~/client/components/ui/textarea";
import { type UseFormReturn } from "react-hook-form";
import type { InternalFormValues } from "./types";
import { Input } from "~/client/components/ui/input";
import { Checkbox } from "~/client/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import { type TranslationKey, useTranslation } from "~/client/lib/i18n";

type AdvancedSectionProps = {
	form: UseFormReturn<InternalFormValues>;
};

type WebhookPhase = {
	name: "preBackupWebhook" | "postBackupWebhook";
	label: TranslationKey;
	urlPlaceholder: string;
	bodyPlaceholder: string;
	description: TranslationKey;
};

type WebhookFieldsProps = {
	form: UseFormReturn<InternalFormValues>;
	phase: WebhookPhase;
};

const WEBHOOK_PHASES: WebhookPhase[] = [
	{
		name: "preBackupWebhook",
		label: "backups.advancedSection.preBackup",
		urlPlaceholder: "http://host.docker.internal:8080/stop",
		bodyPlaceholder: '{"action":"stop"}',
		description: "backups.advancedSection.preBackupDescription",
	},
	{
		name: "postBackupWebhook",
		label: "backups.advancedSection.postBackup",
		urlPlaceholder: "http://host.docker.internal:8080/start",
		bodyPlaceholder: '{"action":"start"}',
		description: "backups.advancedSection.postBackupDescription",
	},
];

const WebhookFields = ({ form, phase }: WebhookFieldsProps) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name={`${phase.name}.url`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.advancedSection.webhook", { label: t(phase.label) })}</FormLabel>
						<FormControl>
							<Input {...field} type="url" placeholder={phase.urlPlaceholder} />
						</FormControl>
						<FormDescription>
							{t("backups.advancedSection.theUrlOriginMust", { description: t(phase.description) })}
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name={`${phase.name}.insecureTls`}
				render={({ field }) => (
					<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
						<FormControl>
							<Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
						</FormControl>
						<div className="space-y-1 leading-none">
							<FormLabel>{t("repositories.advancedTlsForm.skipTlsCertificateVerification")}</FormLabel>
							<FormDescription>
								{t("backups.advancedSection.allowThisWebhookTo", {
									label: t(phase.label).toLowerCase(),
								})}
							</FormDescription>
						</div>
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name={`${phase.name}.headersText`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.advancedSection.webhookHeaders", { label: t(phase.label) })}</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								placeholder={t("backups.advancedSection.authorizationBearerTokenX")}
								className="font-mono text-sm min-h-24"
							/>
						</FormControl>
						<FormDescription>{t("backups.advancedSection.oneHeaderPerLine")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name={`${phase.name}.body`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.advancedSection.webhookBody", { label: t(phase.label) })}</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								placeholder={phase.bodyPlaceholder}
								className="font-mono text-sm min-h-24"
							/>
						</FormControl>
						<FormDescription>{t("backups.advancedSection.optionalRawPostBody")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};

export const AdvancedSection = ({ form }: AdvancedSectionProps) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="maxRetries"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.advancedSection.maximumRetries")}</FormLabel>
						<FormControl>
							<Input
								{...field}
								type="number"
								min={0}
								max={32}
								value={field.value ?? ""}
								placeholder={t("backups.advancedSection.eG2")}
								onChange={(e) => field.onChange(e.target.value)}
							/>
						</FormControl>
						<FormDescription>{t("backups.advancedSection.maximumNumberOfRetry")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="retryDelay"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.advancedSection.retryDelay")}</FormLabel>
						<FormControl>
							<Input
								{...field}
								type="number"
								min={1}
								max={1440}
								step={1}
								placeholder={t("backups.advancedSection.eG15")}
								value={field.value ?? ""}
								onChange={(e) => field.onChange(e.target.value)}
							/>
						</FormControl>
						<FormDescription>{t("backups.advancedSection.delayInMinutesBefore")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			{WEBHOOK_PHASES.map((phase) => (
				<WebhookFields key={phase.name} form={form} phase={phase} />
			))}
			<FormField
				control={form.control}
				name="compressionMode"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.advancedSection.compressionMode")}</FormLabel>
						<Select
							onValueChange={(value) => field.onChange(value === "inherit" ? null : value)}
							value={field.value ?? "inherit"}
						>
							<FormControl>
								<SelectTrigger>
									<SelectValue
										placeholder={t("repositories.createRepositoryForm.selectCompressionMode")}
									/>
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="inherit">
									{t("backups.advancedSection.inheritFromRepository")}
								</SelectItem>
								<SelectItem value="off">{t("repositories.createRepositoryForm.off")}</SelectItem>
								<SelectItem value="auto">{t("repositories.createRepositoryForm.autoFast")}</SelectItem>
								<SelectItem value="max">
									{t("repositories.createRepositoryForm.maxSlowerBetterCompression")}
								</SelectItem>
							</SelectContent>
						</Select>
						<FormDescription>
							{t("backups.advancedSection.overrideTheRepositoryCompression")}
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="customResticParamsText"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.advancedSection.customResticParameters")}</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								placeholder={t("backups.advancedSection.excludeLargerThan500m")}
								className="font-mono text-sm min-h-24"
							/>
						</FormControl>
						<FormDescription>
							{t("backups.advancedSection.advancedEnterOneRestic")}{" "}
							<code className="bg-muted px-1 rounded">--exclude-larger-than 500M</code>
							{t("backups.advancedSection.onlyTheSupportedFlag")}
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
