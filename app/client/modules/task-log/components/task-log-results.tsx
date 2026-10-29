import type { ListTaskHistoryResponse } from "~/client/api-client";
import { CircleAlert, History, Info, SearchX } from "lucide-react";
import { Button } from "~/client/components/ui/button";
import { Skeleton } from "~/client/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/client/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/client/components/ui/tooltip";
import { formatDuration } from "~/client/lib/datetime";
import { TaskLogPagination } from "./task-log-pagination";
import {
	getTaskDurationSeconds,
	OutcomeStatus,
	TaskLogTarget,
	taskLogKindLabels,
	type TaskLogKind,
	type TaskLogOutcome,
} from "./task-log-shared";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	history: ListTaskHistoryResponse | undefined;
	isPending: boolean;
	kind?: TaskLogKind;
	outcome?: TaskLogOutcome;
	page: number;
	now: number;
	formatDateTimeWithSeconds: (timestamp: number) => string;
	onRetry: () => void;
	onPageChange: (page: number) => void;
	onSelectTask: (taskId: string) => void;
};

export function TaskLogResults({
	history,
	isPending,
	kind,
	outcome,
	page,
	now,
	formatDateTimeWithSeconds,
	onRetry,
	onPageChange,
	onSelectTask,
}: Props) {
	const { t } = useTranslation();
	if (isPending) {
		return (
			<div className="space-y-3 p-4" aria-label={t("taskLog.loading")}>
				{Array.from({ length: 6 }, (_, index) => (
					<Skeleton key={index} className="h-11 w-full" />
				))}
			</div>
		);
	}

	if (!history) {
		return (
			<div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
				<CircleAlert className="size-10 text-destructive" />
				<div>
					<p className="font-medium">{t("taskLog.loadFailed")}</p>
					<p className="mt-1 text-sm text-muted-foreground">{t("taskLog.checkConnection")}</p>
				</div>
				<Button variant="outline" onClick={onRetry}>
					{t("common.tryAgain")}
				</Button>
			</div>
		);
	}

	if (history.items.length === 0) {
		return (
			<div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
				<div className="flex size-14 items-center justify-center rounded-full border bg-muted/40">
					{kind || outcome ? (
						<SearchX className="size-6 text-muted-foreground" />
					) : (
						<History className="size-6 text-muted-foreground" />
					)}
				</div>
				<div>
					<p className="font-medium">{kind || outcome ? t("taskLog.noMatch") : t("taskLog.emptyTitle")}</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{kind || outcome ? t("taskLog.noMatchDescription") : t("taskLog.emptyDescription")}
					</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<Table className="min-w-270 border-collapse">
				<TableHeader className="bg-card-header/60">
					<TableRow>
						<TableHead className="pl-4 uppercase">{t("taskLog.taskType")}</TableHead>
						<TableHead className="uppercase">{t("taskLog.outcome")}</TableHead>
						<TableHead className="uppercase">{t("taskLog.target")}</TableHead>
						<TableHead className="uppercase">{t("taskLog.created")}</TableHead>
						<TableHead className="uppercase">{t("taskLog.duration")}</TableHead>
						<TableHead className="uppercase">{t("taskLog.details")}</TableHead>
						<TableHead>
							<span className="sr-only">{t("common.actions")}</span>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{history.items.map((item) => {
						const taskType = t(taskLogKindLabels[item.kind]);
						const durationSeconds = getTaskDurationSeconds(item, now);
						const duration = formatDuration(durationSeconds);

						return (
							<TableRow key={item.id} className="h-14">
								<TableCell className="pl-4 font-medium">{taskType}</TableCell>
								<TableCell>
									<OutcomeStatus outcome={item.outcome} />
								</TableCell>
								<TableCell>
									<TaskLogTarget target={item.target} />
								</TableCell>
								<TableCell className="text-muted-foreground tabular-nums">
									{formatDateTimeWithSeconds(item.createdAt)}
								</TableCell>
								<TableCell className="text-muted-foreground tabular-nums">{duration}</TableCell>
								<TableCell className="max-w-72">
									{item.message ? (
										<span className="block max-w-72 truncate text-muted-foreground">
											{item.message}
										</span>
									) : (
										<span className="text-muted-foreground">&mdash;</span>
									)}
								</TableCell>
								<TableCell className="pr-4 text-right">
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												aria-label={t("taskLog.viewDetailsFor", {
													type: taskType,
													target: item.target.label,
												})}
												onClick={() => onSelectTask(item.id)}
											>
												<Info />
											</Button>
										</TooltipTrigger>
										<TooltipContent>{t("taskLog.viewDetails")}</TooltipContent>
									</Tooltip>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<div className="flex min-h-16 flex-col gap-3 border-t bg-card-header/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm text-muted-foreground tabular-nums">
					{t("taskLog.taskLogResults.showingOf", {
						start: (page - 1) * history.pageSize + 1,
						end: Math.min(page * history.pageSize, history.totalItems),
						total: history.totalItems,
					})}
				</p>
				{history.totalPages > 1 && (
					<TaskLogPagination
						page={page}
						totalPages={history.totalPages}
						kind={kind}
						outcome={outcome}
						onPageChange={onPageChange}
					/>
				)}
			</div>
		</>
	);
}
