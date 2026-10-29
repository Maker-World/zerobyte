import { useId, useState } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Database, HardDrive, Plus } from "lucide-react";
import { toast } from "sonner";
import {
	createBackupScheduleMutation,
	listRepositoriesOptions,
	listVolumesOptions,
} from "~/client/api-client/@tanstack/react-query.gen";
import { Button, buttonVariants } from "~/client/components/ui/button";
import { Card, CardContent } from "~/client/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import { parseError } from "~/client/lib/errors";
import { EmptyState } from "~/client/components/empty-state";
import { getCronExpression } from "~/utils/utils";
import { CreateScheduleForm, type BackupScheduleFormValues } from "../components/create-schedule-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { getBackupRepositoryCompatibility } from "@zerobyte/contracts/backup-context";
import { getSourceLabel } from "~/client/modules/volumes/source-presentation";
import { useTranslation } from "~/client/lib/i18n";

export function CreateBackupPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const formId = useId();
	const [selectedVolumeShortId, setSelectedVolumeShortId] = useState("");

	const { data: volumesData } = useSuspenseQuery({
		...listVolumesOptions(),
	});

	const { data: repositoriesData } = useSuspenseQuery({
		...listRepositoriesOptions(),
	});

	const createSchedule = useMutation({
		...createBackupScheduleMutation(),
		onSuccess: (data) => {
			toast.success(t("backups.createBackup.backupJobCreatedSuccessfully"));
			void navigate({ to: `/backups/${data.shortId}` });
		},
		onError: (error) => {
			toast.error(t("backups.createBackup.failedToCreateBackup"), {
				description: parseError(error)?.message,
			});
		},
	});

	const handleSubmit = (formValues: BackupScheduleFormValues) => {
		if (!selectedVolumeShortId) return;

		const cronExpression = getCronExpression(
			formValues.frequency,
			formValues.dailyTime,
			formValues.weeklyDay,
			formValues.monthlyDays,
			formValues.cronExpression,
		);

		const retentionPolicy: Record<string, number> = {};
		if (formValues.keepLast) retentionPolicy.keepLast = formValues.keepLast;
		if (formValues.keepHourly) retentionPolicy.keepHourly = formValues.keepHourly;
		if (formValues.keepDaily) retentionPolicy.keepDaily = formValues.keepDaily;
		if (formValues.keepWeekly) retentionPolicy.keepWeekly = formValues.keepWeekly;
		if (formValues.keepMonthly) retentionPolicy.keepMonthly = formValues.keepMonthly;
		if (formValues.keepYearly) retentionPolicy.keepYearly = formValues.keepYearly;

		createSchedule.mutate({
			body: {
				name: formValues.name,
				volumeId: selectedVolumeShortId,
				repositoryId: formValues.repositoryId,
				enabled: formValues.frequency !== "manual",
				cronExpression,
				retentionPolicy: Object.keys(retentionPolicy).length > 0 ? retentionPolicy : undefined,
				includePaths: formValues.includePaths,
				includePatterns: formValues.includePatterns,
				excludePatterns: formValues.excludePatterns,
				excludeIfPresent: formValues.excludeIfPresent,
				oneFileSystem: formValues.oneFileSystem,
				customResticParams: formValues.customResticParams,
				compressionMode: formValues.compressionMode,
				backupWebhooks: formValues.backupWebhooks,
				maxRetries: formValues.maxRetries,
				retryDelay: formValues.retryDelay,
			},
		});
	};

	const selectedVolume = volumesData.find((v) => v.shortId === selectedVolumeShortId);
	const hasCompatibleRepository =
		selectedVolume &&
		repositoriesData.some(
			(repository) => getBackupRepositoryCompatibility(selectedVolume, repository.type).compatible,
		);

	if (!volumesData.length) {
		return (
			<EmptyState
				icon={HardDrive}
				title={t("backups.createBackup.noSourceToBack")}
				description={t("backups.createBackup.createASourceTo")}
				button={
					<Link to="/volumes" className={buttonVariants({ variant: "primary" })}>
						{t("backups.createBackup.goToSources")}
					</Link>
				}
			/>
		);
	}

	if (!repositoriesData?.length) {
		return (
			<EmptyState
				icon={Database}
				title={t("repositories.emptyTitle")}
				description={t("backups.createBackup.toCreateABackup")}
				button={
					<Link to="/repositories" className={buttonVariants({ variant: "primary" })}>
						{t("backups.createBackup.goToRepositories")}
					</Link>
				}
			/>
		);
	}

	return (
		<div className="container mx-auto space-y-4">
			<Card>
				<CardContent>
					<Select value={selectedVolumeShortId} onValueChange={setSelectedVolumeShortId}>
						<SelectTrigger id="volume-select" aria-label={t("breadcrumb.source")} className="w-full">
							<SelectValue
								className="min-w-0 flex-1"
								placeholder={t("backups.createBackup.chooseASourceTo")}
							/>
						</SelectTrigger>
						<SelectContent>
							{volumesData.map((volume) => (
								<SelectItem key={volume.shortId} value={volume.shortId}>
									<span className="flex min-w-0 items-center gap-2">
										<HardDrive className="h-4 w-4 shrink-0" />
										<span className="min-w-0 truncate">{getSourceLabel(volume)}</span>
									</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>
			{selectedVolume && !hasCompatibleRepository && (
				<EmptyState
					icon={Database}
					title={t("backups.createBackup.noCompatibleRepository")}
					description={t("backups.createBackup.sourcesOnAnotherMachine")}
					button={
						<Link to="/repositories/create" className={buttonVariants({ variant: "primary" })}>
							{t("repositories.createRepository.createRepository")}
						</Link>
					}
				/>
			)}
			{selectedVolume && hasCompatibleRepository && (
				<>
					<CreateScheduleForm
						key={selectedVolume.shortId}
						volume={selectedVolume}
						onSubmit={handleSubmit}
						formId={formId}
					/>
					<div className="flex justify-end mt-4 gap-2">
						<Button type="submit" variant="primary" form={formId} loading={createSchedule.isPending}>
							<Plus className="h-4 w-4 mr-2" />
							{t("common.create")}
						</Button>
					</div>
				</>
			)}
			{!selectedVolume && (
				<Card>
					<CardContent className="py-16">
						<div className="flex flex-col items-center justify-center text-center">
							<div className="relative mb-6">
								<div className="absolute inset-0 animate-pulse">
									<div className="w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
								</div>
								<div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-primary/20 to-primary/5 border-2 border-primary/20">
									<Database className="w-12 h-12 text-primary/70" strokeWidth={1.5} />
								</div>
							</div>
							<h3 className="text-xl font-semibold mb-2">{t("backups.createBackup.selectASource")}</h3>
							<p className="text-muted-foreground text-sm max-w-md">
								{t("backups.createBackup.chooseASourceFrom")}
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
