import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Textarea } from "~/client/components/ui/textarea";
import { Checkbox } from "~/client/components/ui/checkbox";
import type { UseFormReturn } from "react-hook-form";
import type { InternalFormValues } from "./types";
import { useTranslation } from "~/client/lib/i18n";

type ExcludeSectionProps = {
	form: UseFormReturn<InternalFormValues>;
};

export const ExcludeSection = ({ form }: ExcludeSectionProps) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="excludePatternsText"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("backups.excludeSection.exclusionPatterns")}</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								placeholder={t("backups.excludeSection.tmpNodeModulesCache")}
								className="font-mono text-sm min-h-30"
							/>
						</FormControl>
						<FormDescription>
							{t("backups.excludeSection.patternsSupportGlobSyntax")}
							<a
								href="https://restic.readthedocs.io/en/stable/040_backup.html#excluding-files"
								target="_blank"
								rel="noopener noreferrer"
								className="underline hover:text-foreground"
							>
								{t("backups.excludeSection.resticDocumentation")}
							</a>
							{t("backups.excludeSection.forMoreDetails")}
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="excludeIfPresentText"
				render={({ field }) => (
					<FormItem className="mt-6">
						<FormLabel>{t("backups.excludeSection.excludeIfFilePresent")}</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								placeholder=".nobackup&#10;.exclude-from-backup&#10;CACHEDIR.TAG"
								className="font-mono text-sm min-h-20"
							/>
						</FormControl>
						<FormDescription>
							{t("backups.excludeSection.excludeFoldersContainingA")}{" "}
							<code className="bg-muted px-1 rounded">.nobackup</code>{" "}
							{t("backups.excludeSection.toSkipAnyFolder")}{" "}
							<code className="bg-muted px-1 rounded">.nobackup</code> {t("backups.excludeSection.file")}
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="oneFileSystem"
				render={({ field }) => (
					<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-6">
						<FormControl>
							<Checkbox checked={field.value} onCheckedChange={field.onChange} />
						</FormControl>
						<div className="space-y-1 leading-none">
							<FormLabel>{t("backups.excludeSection.stayOnOneFile")}</FormLabel>
							<FormDescription>{t("backups.excludeSection.preventResticFromCrossing")}</FormDescription>
						</div>
					</FormItem>
				)}
			/>
		</>
	);
};
