import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import type { GetScheduleMirrorsResponse } from "~/client/api-client";
import { cancelTaskMutation } from "~/client/api-client/@tanstack/react-query.gen";
import { RepositoryIcon } from "~/client/components/repository-icon";
import { StatusDot } from "~/client/components/status-dot";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/client/components/ui/alert-dialog";
import { Badge } from "~/client/components/ui/badge";
import { Button } from "~/client/components/ui/button";
import { Switch } from "~/client/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/client/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/client/components/ui/tooltip";
import { isTaskActive, type TaskOfKind } from "~/client/hooks/use-active-tasks";
import { useTimeFormat } from "~/client/lib/datetime";
import { parseError } from "~/client/lib/errors";
import type { Repository } from "~/client/lib/types";
import { cn } from "~/client/lib/utils";
import { useActiveMirrorSyncTasks } from "../mirror-tasks";
import { MirrorSyncDialog } from "./mirror-sync-dialog";
import { MirrorSyncProgressRow } from "./mirror-sync-progress-row";
import { type TFunction, useTranslation } from "~/client/lib/i18n";

type MirrorAssignment = {
	repositoryId: string;
	enabled: boolean;
};

type Props = {
	scheduleShortId: string;
	repositories: Repository[];
	currentMirrors: GetScheduleMirrorsResponse;
	assignments: Map<string, MirrorAssignment>;
	hasChanges: boolean;
	onToggleEnabled: (repositoryId: string) => void;
	onRemove: (repositoryId: string) => void;
};

type CancelConfirmation = {
	taskIds: string[];
	repositoryName: string;
};

type FinishedMirrorSyncTask = NonNullable<GetScheduleMirrorsResponse[number]["lastSyncTask"]>;
type MirrorSyncDisplayTask = FinishedMirrorSyncTask | TaskOfKind<"mirrorSync">;

const getStatusVariant = (task: MirrorSyncDisplayTask | null) => {
	if (!task) return "neutral";
	if (task.status === "succeeded") return "success";
	if (isTaskActive(task)) return "info";
	return "error";
};

const getStatusLabel = (task: MirrorSyncDisplayTask | null, t: TFunction) => {
	if (!task) return t("backups.mirrorRepositoriesTable.neverSynced");
	if (isTaskActive(task)) return t("backups.mirrorRepositoriesTable.syncInProgress");
	if (task.status === "succeeded") return t("backups.mirrorRepositoriesTable.lastSyncSuccessful");
	return task.error ?? t("backups.mirrorRepositoriesTable.lastSyncIncomplete");
};

export const MirrorRepositoriesTable = ({
	scheduleShortId,
	repositories,
	currentMirrors,
	assignments,
	hasChanges,
	onToggleEnabled,
	onRemove,
}: Props) => {
	const { t } = useTranslation();
	const { formatTimeAgo } = useTimeFormat();
	const [statusLookupMirror, setStatusLookupMirror] = useState<Repository | null>(null);
	const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
	const [cancelConfirmation, setCancelConfirmation] = useState<CancelConfirmation | null>(null);
	const { data: activeMirrorSyncs } = useActiveMirrorSyncTasks(scheduleShortId);

	const cancelSync = useMutation({
		...cancelTaskMutation(),
		onError: (error) => {
			toast.error(t("backups.mirrorRepositoriesTable.failedToCancelMirror"), {
				description: parseError(error)?.message,
			});
		},
	});

	const startMirrorStatusLookup = (mirror: Repository) => {
		setStatusLookupMirror(mirror);
	};

	const confirmCancellation = () => {
		if (!cancelConfirmation) return;

		const confirmedCancellation = cancelConfirmation;
		const taskIds = confirmedCancellation.taskIds;
		setCancelConfirmationOpen(false);
		setTimeout(() => {
			setCancelConfirmation((currentConfirmation) =>
				currentConfirmation === confirmedCancellation ? null : currentConfirmation,
			);
		}, 1000);

		for (const taskId of taskIds) {
			cancelSync.mutate({ path: { taskId } });
		}
	};

	const getStatusText = (task: MirrorSyncDisplayTask | null, activeTaskCount: number) => {
		if (!task) return t("time.never");
		if (isTaskActive(task)) {
			return activeTaskCount > 1
				? t("backups.mirrorRepositoriesTable.syncingTasks", { activeTaskCount: activeTaskCount })
				: t("backups.mirrorRepositoriesTable.syncing");
		}
		if (task.finishedAt) {
			return formatTimeAgo(task.finishedAt);
		}
		return t("time.never");
	};

	const assignedRepositories = Array.from(assignments.keys())
		.map((repositoryId) => repositories.find((repository) => repository.shortId === repositoryId))
		.filter((repository) => repository !== undefined);

	const currentMirrorsByRepository = new Map(currentMirrors.map((mirror) => [mirror.repositoryId, mirror]));
	const allActiveMirrorSyncs = activeMirrorSyncs ?? [];

	const closeMirrorStatusLookup = () => setStatusLookupMirror(null);

	if (assignedRepositories.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
				<Copy className="h-8 w-8 mb-2 opacity-20" />
				<p className="text-sm">{t("backups.mirrorRepositoriesTable.noMirrorRepositoriesConfigured")}</p>
				<p className="text-xs mt-1">{t("backups.mirrorRepositoriesTable.clickAddMirrorTo")}</p>
			</div>
		);
	}

	return (
		<>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t("breadcrumb.repository")}</TableHead>
							<TableHead className="text-center w-25">{t("settings.twoFactorSection.enabled")}</TableHead>
							<TableHead className="w-45">{t("backups.mirrorRepositoriesTable.lastSync")}</TableHead>
							<TableHead className="w-12.5" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{assignedRepositories.map((repository) => {
							const assignment = assignments.get(repository.shortId);
							if (!assignment) return null;

							const mirrorSyncs = allActiveMirrorSyncs.filter(
								(task) => task.operationKey === repository.shortId,
							);
							const runningSync = mirrorSyncs.find((task) => task.status === "running");
							const activeSync = runningSync ?? mirrorSyncs[0];
							const syncing = activeSync !== undefined;
							const lastSyncTask =
								currentMirrorsByRepository.get(repository.shortId)?.lastSyncTask ?? null;
							const syncTask = activeSync ?? lastSyncTask;
							const cancellationRequested = mirrorSyncs.some((task) => task.status === "cancelling");
							const cancelling = cancellationRequested || cancelSync.isPending;
							const statusVariant = getStatusVariant(syncTask);
							const statusLabel = getStatusLabel(syncTask, t);
							const statusText = getStatusText(syncTask, mirrorSyncs.length);
							const buttonTooltip = syncing
								? t("backups.mirrorRepositoriesTable.cancelSync")
								: t("backups.mirrorRepositoriesTable.syncMoreSnapshots");

							const handleSyncAction = () => {
								if (activeSync) {
									const taskIds = mirrorSyncs.map((task) => task.id);
									const confirmation = {
										taskIds,
										repositoryName: repository.name,
									};
									setCancelConfirmation(confirmation);
									setCancelConfirmationOpen(true);
									return;
								}
								startMirrorStatusLookup(repository);
							};

							return (
								<Fragment key={repository.shortId}>
									<TableRow>
										<TableCell>
											<div className="flex items-center gap-2">
												<Link
													to="/repositories/$repositoryId"
													params={{ repositoryId: repository.shortId }}
													className="hover:underline flex items-center gap-2"
												>
													<RepositoryIcon backend={repository.type} className="h-4 w-4" />
													<span className="font-medium">{repository.name}</span>
												</Link>
												<Badge variant="outline" className="text-[10px] align-middle">
													{repository.type}
												</Badge>
											</div>
										</TableCell>
										<TableCell className="text-center">
											<Switch
												className="align-middle"
												checked={assignment.enabled}
												onCheckedChange={() => onToggleEnabled(repository.shortId)}
											/>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<div className="w-3 shrink-0 mr-1">
													<StatusDot
														variant={statusVariant}
														label={statusLabel}
														animated={syncing}
													/>
												</div>
												<span className="text-sm text-muted-foreground">{statusText}</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															aria-label={buttonTooltip}
															onClick={handleSyncAction}
															disabled={syncing ? cancelling : hasChanges}
															className={cn("h-8 w-8 text-muted-foreground", {
																"hover:text-destructive": syncing,
																"hover:text-foreground": !syncing,
															})}
														>
															<RefreshCw
																className={cn("h-4 w-4", {
																	"animate-spin": syncing,
																})}
															/>
														</Button>
													</TooltipTrigger>
													<TooltipContent>{buttonTooltip}</TooltipContent>
												</Tooltip>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => onRemove(repository.shortId)}
													className="h-8 w-8 text-muted-foreground hover:text-destructive align-baseline"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
									{syncing && <MirrorSyncProgressRow tasks={mirrorSyncs} />}
								</Fragment>
							);
						})}
					</TableBody>
				</Table>
			</div>

			{statusLookupMirror && (
				<MirrorSyncDialog
					key={statusLookupMirror.shortId}
					scheduleShortId={scheduleShortId}
					mirror={statusLookupMirror}
					onClose={closeMirrorStatusLookup}
				/>
			)}

			<AlertDialog
				open={cancelConfirmationOpen}
				onOpenChange={(open) => !open && setCancelConfirmationOpen(false)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("backups.mirrorRepositoriesTable.cancelMirrorSync")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("backups.mirrorRepositoriesTable.areYouSureYou")}
							<strong>{cancelConfirmation?.repositoryName}</strong>
							{t("backups.mirrorRepositoriesTable.snapshotsThatHaveAlready")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="flex gap-3 justify-end">
						<AlertDialogCancel disabled={cancelSync.isPending}>
							{t("backups.mirrorRepositoriesTable.keepSyncing")}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmCancellation}
							disabled={cancelSync.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{t("backups.mirrorRepositoriesTable.cancelSync")}
						</AlertDialogAction>
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
