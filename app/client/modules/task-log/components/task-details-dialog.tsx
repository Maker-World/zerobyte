import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/client/components/ui/dialog";
import { formatDuration, useTimeFormat } from "~/client/lib/datetime";
import {
	getTaskDurationSeconds,
	OutcomeStatus,
	taskLogKindLabels,
	TaskLogTarget,
	type TaskLogItem,
} from "./task-log-shared";
import { useTranslation } from "~/client/lib/i18n";

export function TaskDetailsDialog({
	task,
	now,
	onOpenChange,
}: {
	task: TaskLogItem | null;
	now: number;
	onOpenChange: (open: boolean) => void;
}) {
	const { formatDateTimeWithSeconds } = useTimeFormat();
	const { t } = useTranslation();
	const taskType = task ? t(taskLogKindLabels[task.kind]) : null;
	const durationSeconds = task ? getTaskDurationSeconds(task, now) : null;
	const duration = durationSeconds === null ? null : formatDuration(durationSeconds);

	return (
		<Dialog open={task !== null} onOpenChange={onOpenChange}>
			<DialogContent className="grid max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-xl">
				{task && (
					<>
						<DialogHeader className="border-b px-6 py-5 pr-12">
							<DialogTitle>{t("taskLog.taskDetails")}</DialogTitle>
							<DialogDescription className="truncate">
								{taskType} · {task.target.label}
							</DialogDescription>
						</DialogHeader>
						<div className="min-h-0 overflow-y-auto px-6 py-5 overscroll-contain">
							<dl className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-5 gap-y-3 text-sm">
								<dt className="text-muted-foreground">{t("taskLog.taskType")}</dt>
								<dd className="font-medium">{taskType}</dd>
								<dt className="text-muted-foreground">{t("taskLog.target")}</dt>
								<dd>
									<TaskLogTarget target={task.target} />
								</dd>
								<dt className="text-muted-foreground">{t("taskLog.outcome")}</dt>
								<dd>
									<OutcomeStatus outcome={task.outcome} />
								</dd>
								<dt className="text-muted-foreground">{t("taskLog.lifecycle")}</dt>
								<dd>{task.status}</dd>
								<dt className="text-muted-foreground">{t("taskLog.created")}</dt>
								<dd className="tabular-nums">{formatDateTimeWithSeconds(task.createdAt)}</dd>
								<dt className="text-muted-foreground">{t("taskLog.started")}</dt>
								<dd className="tabular-nums">
									{task.startedAt === null
										? t("taskLog.notStarted")
										: formatDateTimeWithSeconds(task.startedAt)}
								</dd>
								<dt className="text-muted-foreground">{t("taskLog.finished")}</dt>
								<dd className="tabular-nums">
									{task.finishedAt === null
										? t("taskLog.notFinished")
										: formatDateTimeWithSeconds(task.finishedAt)}
								</dd>
								<dt className="text-muted-foreground">{t("taskLog.duration")}</dt>
								<dd className="tabular-nums">{duration}</dd>
							</dl>
							{task.message && (
								<div className="mt-5 rounded-md border bg-muted/40 p-4">
									<p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
										{t("taskLog.details")}
									</p>
									<p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
										{task.message}
									</p>
								</div>
							)}
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
