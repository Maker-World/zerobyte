import type { DeepPartial } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { listRepositoriesOptions } from "~/client/api-client/@tanstack/react-query.gen";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/client/components/ui/card";
import { cn } from "~/client/lib/utils";
import type { Volume } from "~/client/lib/types";
import type { InternalFormValues } from "./types";
import { getSourceLabel } from "~/client/modules/volumes/source-presentation";
import { useTranslation } from "~/client/lib/i18n";

type SummarySectionProps = {
	volume: Volume;
	frequency: string | undefined;
	formValues: DeepPartial<InternalFormValues>;
};

export const SummarySection = ({ volume, frequency, formValues }: SummarySectionProps) => {
	const { t } = useTranslation();
	const { data: repositoriesData } = useQuery({
		...listRepositoriesOptions(),
	});

	const retentionSummary = [
		["last", formValues.keepLast],
		["hourly", formValues.keepHourly],
		["daily", formValues.keepDaily],
		["weekly", formValues.keepWeekly],
		["monthly", formValues.keepMonthly],
		["yearly", formValues.keepYearly],
	]
		.filter(([, value]) => Boolean(value))
		.map(([label, value]) => `${value} ${label}`)
		.join(", ");

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-4">
				<div>
					<CardTitle>{t("backups.summarySection.scheduleSummary")}</CardTitle>
					<CardDescription>{t("backups.summarySection.reviewTheBackupConfiguration")}</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 text-sm">
				<div>
					<p className="text-xs uppercase text-muted-foreground">{t("breadcrumb.source")}</p>
					<p className="font-medium [overflow-wrap:anywhere]">{getSourceLabel(volume)}</p>
				</div>
				<div>
					<p className="text-xs uppercase text-muted-foreground">{t("backups.card.schedule")}</p>
					<p className="font-medium">
						<span className={cn({ hidden: frequency !== "manual" })}>{t("backups.card.manualOnly")}</span>
						<span className={cn({ hidden: !frequency || frequency === "manual" })}>
							{frequency ? frequency.charAt(0).toUpperCase() + frequency.slice(1) : null}
						</span>
						<span className={cn({ hidden: Boolean(frequency) })}>-</span>
					</p>
				</div>
				<div>
					<p className="text-xs uppercase text-muted-foreground">{t("breadcrumb.repository")}</p>
					<p className="font-medium">
						{repositoriesData?.find((r) => r.shortId === formValues.repositoryId)?.name || "—"}
					</p>
				</div>
				<div className={cn({ hidden: !formValues.includePaths?.length && !formValues.includePatterns })}>
					<p className="text-xs uppercase text-muted-foreground">
						{t("backups.summarySection.includePathsPatterns")}
					</p>
					<div className="flex flex-col gap-1">
						{formValues.includePaths?.slice(0, 20).map((path) => (
							<span key={path} className="text-xs font-mono bg-accent px-1.5 py-0.5 rounded">
								{path}
							</span>
						))}
						{formValues.includePaths && formValues.includePaths.length > 20 && (
							<span className="text-xs text-muted-foreground">
								{t("repositories.snapshotDetails.more", { value: formValues.includePaths.length - 20 })}
							</span>
						)}
						{formValues.includePatterns
							?.split("\n")
							.filter(Boolean)
							.slice(0, 20 - (formValues.includePaths?.length || 0))
							.map((pattern) => (
								<span key={pattern} className="text-xs font-mono bg-accent px-1.5 py-0.5 rounded">
									{pattern.trim()}
								</span>
							))}
					</div>
				</div>
				{formValues.excludePatternsText && (
					<div>
						<p className="text-xs uppercase text-muted-foreground">
							{t("backups.createScheduleForm.excludePatterns")}
						</p>
						<div className="flex flex-col gap-1">
							{formValues.excludePatternsText
								.split("\n")
								.filter(Boolean)
								.map((pattern) => (
									<span key={pattern} className="text-xs font-mono bg-accent px-1.5 py-0.5 rounded">
										{pattern.trim()}
									</span>
								))}
						</div>
					</div>
				)}
				{formValues.excludeIfPresentText && (
					<div>
						<p className="text-xs uppercase text-muted-foreground">
							{t("backups.summarySection.excludeIfPresent")}
						</p>
						<div className="flex flex-col gap-1">
							{formValues.excludeIfPresentText
								.split("\n")
								.filter(Boolean)
								.map((filename) => (
									<span key={filename} className="text-xs font-mono bg-accent px-1.5 py-0.5 rounded">
										{filename.trim()}
									</span>
								))}
						</div>
					</div>
				)}
				<div>
					<p className="text-xs uppercase text-muted-foreground">
						{t("backups.summarySection.oneFileSystem")}
					</p>
					<p className="font-medium">
						{formValues.oneFileSystem ? t("settings.twoFactorSection.enabled") : t("status.disabled")}
					</p>
				</div>
				<div>
					<p className="text-xs uppercase text-muted-foreground">{t("common.compression")}</p>
					<p className="font-medium">
						{formValues.compressionMode ?? t("backups.summarySection.inheritRepositoryDefault")}
					</p>
				</div>
				<div>
					<p className="text-xs uppercase text-muted-foreground">{t("backups.summarySection.retention")}</p>
					<p className="font-medium">{retentionSummary || "-"}</p>
				</div>
			</CardContent>
		</Card>
	);
};
