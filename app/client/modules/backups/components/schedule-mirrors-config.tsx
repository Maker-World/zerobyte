import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Copy, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { GetScheduleMirrorsResponse } from "~/client/api-client";
import {
	getMirrorCompatibilityOptions,
	getScheduleMirrorsOptions,
	updateScheduleMirrorsMutation,
} from "~/client/api-client/@tanstack/react-query.gen";
import { RepositoryIcon } from "~/client/components/repository-icon";
import { Button } from "~/client/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/client/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/client/components/ui/tooltip";
import { parseError } from "~/client/lib/errors";
import type { Repository } from "~/client/lib/types";
import { cn } from "~/client/lib/utils";
import { MirrorRepositoriesTable } from "./mirror-repositories-table";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	scheduleShortId: string;
	primaryRepositoryId: string;
	repositories: Repository[];
	initialData: GetScheduleMirrorsResponse;
};

type MirrorAssignment = {
	repositoryId: string;
	enabled: boolean;
};

const buildAssignments = (mirrors: GetScheduleMirrorsResponse) =>
	new Map<string, MirrorAssignment>(
		mirrors.map((mirror) => [
			mirror.repositoryId,
			{
				repositoryId: mirror.repositoryId,
				enabled: mirror.enabled,
			},
		]),
	);

export const ScheduleMirrorsConfig = ({ scheduleShortId, primaryRepositoryId, repositories, initialData }: Props) => {
	const { t } = useTranslation();
	const [draftAssignments, setAssignments] = useState<Map<string, MirrorAssignment> | null>(null);
	const hasChanges = draftAssignments !== null;
	const [isAddingNew, setIsAddingNew] = useState(false);

	const { data: currentMirrors } = useSuspenseQuery({
		...getScheduleMirrorsOptions({ path: { shortId: scheduleShortId } }),
		initialData,
	});

	const assignments = draftAssignments ?? buildAssignments(currentMirrors);

	const { data: compatibility } = useQuery({
		...getMirrorCompatibilityOptions({ path: { shortId: scheduleShortId } }),
	});

	const updateMirrors = useMutation({
		...updateScheduleMirrorsMutation(),
		onSuccess: () => {
			toast.success(t("backups.scheduleMirrorsConfig.mirrorSettingsSavedSuccessfully"));
			setAssignments(null);
		},
		onError: (error) => {
			toast.error(t("backups.scheduleMirrorsConfig.failedToSaveMirror"), {
				description: parseError(error)?.message,
			});
		},
	});

	const compatibilityMap = useMemo(() => {
		const map = new Map<string, { compatible: boolean; reason: string | null }>();
		if (compatibility) {
			for (const item of compatibility) {
				map.set(item.repositoryId, { compatible: item.compatible, reason: item.reason });
			}
		}
		return map;
	}, [compatibility]);

	const addRepository = (repositoryId: string) => {
		const newAssignments = new Map(assignments);
		newAssignments.set(repositoryId, {
			repositoryId,
			enabled: true,
		});

		setAssignments(newAssignments);
		setIsAddingNew(false);
	};

	const removeRepository = (repositoryId: string) => {
		const newAssignments = new Map(assignments);
		newAssignments.delete(repositoryId);
		setAssignments(newAssignments);
	};

	const toggleEnabled = (repositoryId: string) => {
		const assignment = assignments.get(repositoryId);
		if (!assignment) return;

		const newAssignments = new Map(assignments);
		newAssignments.set(repositoryId, {
			...assignment,
			enabled: !assignment.enabled,
		});

		setAssignments(newAssignments);
	};

	const handleSave = () => {
		const mirrors = Array.from(assignments.values()).map((assignment) => ({
			repositoryId: assignment.repositoryId,
			enabled: assignment.enabled,
		}));
		updateMirrors.mutate({
			path: { shortId: scheduleShortId },
			body: { mirrors },
		});
	};

	const handleReset = () => {
		setAssignments(null);
	};

	const selectableRepositories = repositories.filter((repository) => {
		if (repository.shortId === primaryRepositoryId) return false;
		if (assignments.has(repository.shortId)) return false;
		return true;
	});
	const hasAvailableRepositories = selectableRepositories.some((repository) => {
		const repositoryCompatibility = compatibilityMap.get(repository.shortId);
		return repositoryCompatibility?.compatible !== false;
	});
	const showAddMirrorButton = !isAddingNew && selectableRepositories.length > 0;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Copy className="h-5 w-5" />
							{t("backups.scheduleMirrorsConfig.mirrorRepositories")}
						</CardTitle>
						<CardDescription className="hidden @md:block mt-1">
							{t("backups.scheduleMirrorsConfig.configureSecondaryRepositoriesWhere")}
						</CardDescription>
					</div>
					{showAddMirrorButton && (
						<Button variant="outline" size="sm" onClick={() => setIsAddingNew(true)}>
							<Plus className="h-4 w-4 mr-2" />
							{t("backups.scheduleMirrorsConfig.addMirror")}
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{isAddingNew && (
					<div className="mb-6 flex items-center gap-2 max-w-md">
						<Select onValueChange={addRepository}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={t("backups.scheduleMirrorsConfig.selectARepositoryTo")} />
							</SelectTrigger>
							<SelectContent>
								{selectableRepositories.map((repository) => {
									const repositoryCompatibility = compatibilityMap.get(repository.shortId);
									const repositoryCompatible = repositoryCompatibility?.compatible ?? false;
									const compatibilityReason =
										repositoryCompatibility?.reason ??
										t("backups.scheduleMirrorsConfig.thisRepositoryIsNot");

									return (
										<Tooltip key={repository.shortId}>
											<TooltipTrigger asChild>
												<div>
													<SelectItem
														value={repository.shortId}
														disabled={!repositoryCompatible}
													>
														<div className="flex items-center gap-2">
															<RepositoryIcon
																backend={repository.type}
																className="h-4 w-4"
															/>
															<span>{repository.name}</span>
															<span className="text-xs uppercase text-muted-foreground">
																({repository.type})
															</span>
														</div>
													</SelectItem>
												</div>
											</TooltipTrigger>
											<TooltipContent
												side="right"
												className={cn("max-w-xs", {
													hidden: repositoryCompatible,
												})}
											>
												<p>{compatibilityReason}</p>
												<p className="mt-1 text-xs text-muted-foreground">
													{t("backups.scheduleMirrorsConfig.considerCreatingANew")}
												</p>
											</TooltipContent>
										</Tooltip>
									);
								})}
								{!hasAvailableRepositories && selectableRepositories.length > 0 && (
									<div className="px-2 py-3 text-sm text-muted-foreground text-center">
										{t("backups.scheduleMirrorsConfig.allAvailableRepositoriesHave")}
										<br />
										<span className="text-xs">
											{t("backups.scheduleMirrorsConfig.considerCreatingANew")}
										</span>
									</div>
								)}
							</SelectContent>
						</Select>
						<Button variant="ghost" size="sm" onClick={() => setIsAddingNew(false)}>
							{t("common.cancel")}
						</Button>
					</div>
				)}

				<MirrorRepositoriesTable
					scheduleShortId={scheduleShortId}
					repositories={repositories}
					currentMirrors={currentMirrors}
					assignments={assignments}
					hasChanges={hasChanges}
					onToggleEnabled={toggleEnabled}
					onRemove={removeRepository}
				/>

				{hasChanges && (
					<div className="flex gap-2 justify-end mt-4 pt-4">
						<Button variant="outline" size="sm" onClick={handleReset}>
							{t("common.cancel")}
						</Button>
						<Button variant="default" size="sm" onClick={handleSave} loading={updateMirrors.isPending}>
							{t("volumes.createVolumeForm.saveChanges")}
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
