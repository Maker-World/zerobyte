import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { InternalFormValues } from "./types";
import { useTranslation } from "~/client/lib/i18n";

type RetentionSectionProps = {
	form: UseFormReturn<InternalFormValues>;
};

export const RetentionSection = ({ form }: RetentionSectionProps) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="keepLast"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.retentionSection.keepLastNSnapshots")}</FormLabel>
						<FormControl>
							<Input
								{...field}
								type="number"
								min={0}
								placeholder={t("backups.retentionSection.optional")}
								value={field.value ?? ""}
								onChange={(v) => field.onChange(v.target.value)}
							/>
						</FormControl>
						<FormDescription>{t("backups.retentionSection.keepTheNMost")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="keepHourly"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.retentionSection.keepHourly")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								min={0}
								placeholder={t("backups.retentionSection.optional")}
								{...field}
								value={field.value ?? ""}
								onChange={(v) => field.onChange(v.target.value)}
							/>
						</FormControl>
						<FormDescription>{t("backups.retentionSection.keepTheLastN")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="keepDaily"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.retentionSection.keepDaily")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								min={0}
								placeholder={t("backups.retentionSection.eG7")}
								{...field}
								value={field.value ?? ""}
								onChange={(v) => field.onChange(v.target.value)}
							/>
						</FormControl>
						<FormDescription>{t("backups.retentionSection.keepTheLastN2")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="keepWeekly"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.retentionSection.keepWeekly")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								min={0}
								placeholder={t("backups.retentionSection.eG4")}
								{...field}
								value={field.value ?? ""}
								onChange={(v) => field.onChange(v.target.value)}
							/>
						</FormControl>
						<FormDescription>{t("backups.retentionSection.keepTheLastN3")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="keepMonthly"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.retentionSection.keepMonthly")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								min={0}
								placeholder={t("backups.retentionSection.eG6")}
								{...field}
								value={field.value ?? ""}
								onChange={(v) => field.onChange(v.target.value)}
							/>
						</FormControl>
						<FormDescription>{t("backups.retentionSection.keepTheLastN4")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="keepYearly"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.retentionSection.keepYearly")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								min={0}
								placeholder={t("backups.retentionSection.optional")}
								{...field}
								value={field.value ?? ""}
								onChange={(v) => field.onChange(v.target.value)}
							/>
						</FormControl>
						<FormDescription>{t("backups.retentionSection.keepTheLastN5")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
