import { Card, CardContent } from "~/client/components/ui/card";
import { ByteSize } from "~/client/components/bytes-size";
import { useRootLoaderData } from "~/client/hooks/use-root-loader-data";
import type { ResticSnapshotSummaryDto } from "@zerobyte/core/restic";
import { formatDuration } from "~/client/lib/datetime";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	summary?: ResticSnapshotSummaryDto | null;
};

const getDurationLabel = (start: string, end: string) => {
	const startMs = new Date(start).getTime();
	const endMs = new Date(end).getTime();
	if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) return "-";
	return formatDuration(Math.round((endMs - startMs) / 1000));
};

export const BackupSummaryCard = ({ summary }: Props) => {
	const { t } = useTranslation();
	const { locale } = useRootLoaderData();

	if (!summary) return null;

	const formatCount = (value: number) => value.toLocaleString(locale);
	const durationLabel = getDurationLabel(summary.backup_start, summary.backup_end);

	const topStats = [
		{
			label: t("components.backupSummaryCard.dataAdded"),
			value: <ByteSize bytes={summary.data_added} base={1024} />,
		},
		{
			label: t("components.backupSummaryCard.dataStored"),
			value: <ByteSize bytes={summary.data_added_packed ?? 0} base={1024} />,
		},
		{
			label: t("components.backupSummaryCard.filesProcessed"),
			value: formatCount(summary.total_files_processed),
		},
		{
			label: t("components.backupSummaryCard.bytesProcessed"),
			value: <ByteSize bytes={summary.total_bytes_processed} base={1024} />,
		},
		{
			label: t("taskLog.duration"),
			value: durationLabel,
		},
	];

	const detailStats = [
		{ label: t("components.backupSummaryCard.newFiles"), value: formatCount(summary.files_new) },
		{ label: t("components.backupSummaryCard.changedFiles"), value: formatCount(summary.files_changed) },
		{ label: t("components.backupSummaryCard.unmodifiedFiles"), value: formatCount(summary.files_unmodified) },
		{ label: t("components.backupSummaryCard.newDirs"), value: formatCount(summary.dirs_new) },
		{ label: t("components.backupSummaryCard.changedDirs"), value: formatCount(summary.dirs_changed) },
		{ label: t("components.backupSummaryCard.unmodifiedDirs"), value: formatCount(summary.dirs_unmodified) },
		{ label: t("components.backupSummaryCard.dataBlobs"), value: formatCount(summary.data_blobs) },
		{ label: t("components.backupSummaryCard.treeBlobs"), value: formatCount(summary.tree_blobs) },
	];

	return (
		<Card className="p-4">
			<CardContent className="px-4">
				<div className="grid gap-6 grid-cols-2 lg:grid-cols-5">
					{topStats.map((stat) => (
						<div key={stat.label} className="flex flex-col gap-1">
							<span className="text-[11px] uppercase tracking-wide text-muted-foreground">
								{stat.label}
							</span>
							<span className="text-sm font-semibold text-foreground">{stat.value}</span>
						</div>
					))}
				</div>
				<div className="mt-4 border-t border-border/60 pt-3">
					<div className="grid gap-x-6 gap-y-2 grid-cols-2 lg:grid-cols-4">
						{detailStats.map((stat) => (
							<div key={stat.label} className="flex items-center justify-start text-xs gap-2">
								<span className="font-semibold text-foreground">{stat.value}</span>
								<span className="text-muted-foreground">{stat.label}</span>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
