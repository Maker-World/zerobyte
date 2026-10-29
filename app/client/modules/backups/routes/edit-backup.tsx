import { useId } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { getBackupScheduleOptions, updateBackupScheduleMutation } from "~/client/api-client/@tanstack/react-query.gen";
import { Button } from "~/client/components/ui/button";
import { parseError } from "~/client/lib/errors";
import { useNavigate } from "@tanstack/react-router";
import { getCronExpression } from "~/utils/utils";
import { CreateScheduleForm, type BackupScheduleFormValues } from "../components/create-schedule-form";
import { useTranslation } from "~/client/lib/i18n";

export function EditBackupPage({ backupId }: { backupId: string }) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const formId = useId();

	const { data: schedule } = useSuspenseQuery({
		...getBackupScheduleOptions({ path: { shortId: backupId } }),
	});

	const updateSchedule = useMutation({
		...updateBackupScheduleMutation(),
		onSuccess: () => {
			toast.success(t("backups.backupDetails.backupScheduleSavedSuccessfully"));
			void navigate({ to: `/backups/${schedule.shortId}` });
		},
		onError: (error) => {
			toast.error(t("backups.backupDetails.failedToSaveBackup"), {
				description: parseError(error)?.message,
			});
		},
	});

	const handleSubmit = (formValues: BackupScheduleFormValues) => {
		const cronExpression = getCronExpression(
			formValues.frequency,
			formValues.dailyTime,
			formValues.weeklyDay,
			formValues.monthlyDays,
			formValues.cronExpression,
		);

		const retentionPolicy: NonNullable<typeof schedule.retentionPolicy> = {};
		if (schedule.retentionPolicy?.keepWithinDuration) {
			retentionPolicy.keepWithinDuration = schedule.retentionPolicy.keepWithinDuration;
		}
		if (formValues.keepLast) retentionPolicy.keepLast = formValues.keepLast;
		if (formValues.keepHourly) retentionPolicy.keepHourly = formValues.keepHourly;
		if (formValues.keepDaily) retentionPolicy.keepDaily = formValues.keepDaily;
		if (formValues.keepWeekly) retentionPolicy.keepWeekly = formValues.keepWeekly;
		if (formValues.keepMonthly) retentionPolicy.keepMonthly = formValues.keepMonthly;
		if (formValues.keepYearly) retentionPolicy.keepYearly = formValues.keepYearly;

		updateSchedule.mutate({
			path: { shortId: schedule.shortId },
			body: {
				...formValues,
				enabled: formValues.frequency === "manual" ? false : schedule.enabled,
				cronExpression,
				retentionPolicy,
			},
		});
	};

	return (
		<div>
			<CreateScheduleForm
				volume={schedule.volume}
				initialValues={schedule}
				onSubmit={handleSubmit}
				formId={formId}
			/>
			<div className="flex justify-end mt-4 gap-2">
				<Button
					type="submit"
					className="ml-auto"
					variant="primary"
					form={formId}
					loading={updateSchedule.isPending}
				>
					<Save className="h-4 w-4 mr-2" />
					{t("backups.editBackup.updateSchedule")}
				</Button>
				<Button variant="outline" onClick={() => navigate({ to: `/backups/${schedule.shortId}` })}>
					<X className="h-4 w-4 mr-2" />
					{t("common.cancel")}
				</Button>
			</div>
		</div>
	);
}
