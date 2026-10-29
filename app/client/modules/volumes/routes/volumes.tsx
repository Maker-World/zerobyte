import { useSuspenseQuery } from "@tanstack/react-query";
import {
	createColumnHelper,
	flexRender,
	type ColumnFiltersState,
	type SortingState,
	useTable,
} from "@tanstack/react-table";
import { HardDrive, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { listVolumesOptions } from "~/client/api-client/@tanstack/react-query.gen";
import type { ListVolumesResponse } from "~/client/api-client/types.gen";
import { DataTableSortHeader } from "~/client/components/data-table-sort-header";
import { EmptyState } from "~/client/components/empty-state";
import { StatusDot } from "~/client/components/status-dot";
import { Button } from "~/client/components/ui/button";
import { Card } from "~/client/components/ui/card";
import { Input } from "~/client/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/client/components/ui/table";
import { VolumeIcon } from "~/client/components/volume-icon";
import { useNavigate } from "@tanstack/react-router";
import { dataTableFeatures } from "~/client/lib/data-table";
import { cn } from "~/client/lib/utils";
import { useCookieState } from "~/client/hooks/use-cookie-state";
import { getVolumeStatusLabel, getVolumeStatusVariant } from "../source-presentation";
import { Trans, useTranslation } from "~/client/lib/i18n";

type VolumeRow = ListVolumesResponse[number] & {
	backend: string;
};

const volumeColumnHelper = createColumnHelper<typeof dataTableFeatures, VolumeRow>();
const volumeColumns = volumeColumnHelper.columns([
	volumeColumnHelper.accessor("name", {
		header: ({ column }) => (
			<DataTableSortHeader column={column} title="common.name" sortDirection={column.getIsSorted()} />
		),
		cell: ({ row }) => (
			<div className="min-w-0 max-w-64">
				<span className="block truncate" title={row.original.name}>
					{row.original.name}
				</span>
				{row.original.sourceLocation && (
					<span className="block truncate font-sans text-xs text-muted-foreground">
						{row.original.sourceLocation.machine}
					</span>
				)}
			</div>
		),
	}),
	volumeColumnHelper.accessor("backend", {
		header: ({ column }) => (
			<DataTableSortHeader column={column} title="common.backend" sortDirection={column.getIsSorted()} />
		),
		cell: ({ row }) => {
			if (row.original.sourceKind === "filesystem") {
				return (
					<span className="font-sans text-sm">
						<Trans k="volumes.filesystem" />
					</span>
				);
			}
			return <VolumeIcon backend={row.original.type} />;
		},
		filterFn: (row, id, value) => row.getValue(id) === value,
	}),
	volumeColumnHelper.accessor("status", {
		header: ({ column }) => (
			<DataTableSortHeader column={column} title="common.status" sortDirection={column.getIsSorted()} center />
		),
		cell: ({ row }) => (
			<StatusDot variant={getVolumeStatusVariant(row.original)} label={getVolumeStatusLabel(row.original)} />
		),
		filterFn: (row, id, value) => row.getValue(id) === value,
	}),
]);

export function VolumesPage() {
	const { t } = useTranslation();
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = useCookieState<SortingState>("sorting_volumes", []);

	const navigate = useNavigate();
	const { data } = useSuspenseQuery({ ...listVolumesOptions() });

	const tableData: VolumeRow[] = data.map((volume) => ({
		...volume,
		backend: volume.type ?? "filesystem",
	}));

	const table = useTable({
		features: dataTableFeatures,
		data: tableData,
		columns: volumeColumns,
		state: { columnFilters, sorting },
		onColumnFiltersChange: setColumnFilters,
		onSortingChange: setSorting,
	});

	const rows = table.getRowModel().rows;
	const hasFilters = columnFilters.length > 0;

	const clearFilters = () => table.resetColumnFilters();

	const hasNoVolumes = data.length === 0;
	const hasNoFilteredVolumes = rows.length === 0 && !hasNoVolumes;

	if (hasNoVolumes) {
		return (
			<EmptyState
				icon={HardDrive}
				title={t("volumes.emptyTitle")}
				description={t("volumes.emptyDescription")}
				button={
					<Button onClick={() => navigate({ to: "/volumes/create" })}>
						<Plus size={16} className="mr-2" />
						{t("volumes.create")}
					</Button>
				}
			/>
		);
	}

	const search = (table.getColumn("name")?.getFilterValue() as string) ?? "";
	const status = (table.getColumn("status")?.getFilterValue() as string) ?? "";
	const type = (table.getColumn("backend")?.getFilterValue() as string) ?? "";

	return (
		<Card className="p-0 gap-0">
			<div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 md:justify-between p-4 bg-card-header py-4">
				<span className="flex flex-col sm:flex-row items-stretch md:items-center gap-2 flex-wrap">
					<Input
						className="w-full lg:w-45 min-w-45"
						placeholder={t("common.searchPlaceholder")}
						value={search}
						onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
					/>
					<Select value={status} onValueChange={(value) => table.getColumn("status")?.setFilterValue(value)}>
						<SelectTrigger className="w-full lg:w-45 min-w-45">
							<SelectValue placeholder={t("common.allStatus")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="mounted">{t("status.available")}</SelectItem>
							<SelectItem value="unmounted">{t("status.unavailable")}</SelectItem>
							<SelectItem value="error">{t("status.error")}</SelectItem>
						</SelectContent>
					</Select>
					<Select value={type} onValueChange={(value) => table.getColumn("backend")?.setFilterValue(value)}>
						<SelectTrigger className="w-full lg:w-45 min-w-45">
							<SelectValue placeholder={t("common.allBackends")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="directory">{t("volumes.directory")}</SelectItem>
							<SelectItem value="nfs">NFS</SelectItem>
							<SelectItem value="smb">SMB</SelectItem>
							<SelectItem value="webdav">WebDAV</SelectItem>
							<SelectItem value="sftp">SFTP</SelectItem>
							<SelectItem value="rclone">rclone</SelectItem>
							<SelectItem value="filesystem">{t("volumes.filesystem")}</SelectItem>
						</SelectContent>
					</Select>
					{hasFilters && (
						<Button onClick={clearFilters} className="w-full lg:w-auto mt-2 lg:mt-0 lg:ml-2">
							<RotateCcw className="h-4 w-4 mr-2" />
							{t("common.clearFilters")}
						</Button>
					)}
				</span>
				<Button onClick={() => navigate({ to: "/volumes/create" })}>
					<Plus size={16} className="mr-2" />
					{t("volumes.create")}
				</Button>
			</div>
			<div className="overflow-x-auto">
				<Table className="border-t">
					<TableHeader className="bg-card-header">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className={cn("uppercase", {
											"w-25": header.column.id === "name",
											"text-left": header.column.id === "backend",
											"text-center": header.column.id === "status",
										})}
									>
										{!header.isPlaceholder &&
											flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						<TableRow className={cn({ hidden: !hasNoFilteredVolumes })}>
							<TableCell colSpan={3} className="text-center py-12">
								<div className="flex flex-col items-center gap-3">
									<p className="text-muted-foreground">{t("volumes.noMatchFilters")}</p>
									<Button onClick={clearFilters} variant="outline" size="sm">
										<RotateCcw className="h-4 w-4 mr-2" />
										{t("common.clearFilters")}
									</Button>
								</div>
							</TableCell>
						</TableRow>
						{rows.map((row) => (
							<TableRow
								key={row.original.shortId}
								className="hover:bg-muted/50 hover:cursor-pointer transition-colors h-12"
								onClick={() => navigate({ to: `/volumes/${row.original.shortId}` })}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										className={cn("font-mono", {
											"font-medium text-strong-accent": cell.column.id === "name",
											"text-muted-foreground": cell.column.id === "backend",
											"text-center": cell.column.id === "status",
										})}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<div className="px-4 py-2 text-sm text-muted-foreground bg-card-header flex justify-end border-t font-mono">
				<span className={cn({ hidden: !hasNoFilteredVolumes })}>{t("volumes.noMatchFilters")}</span>
				<span className={cn("font-mono", { hidden: hasNoFilteredVolumes })}>
					<span className="text-strong-accent font-bold">{rows.length}</span>{" "}
					{rows.length > 1 ? t("volumes.countPlural") : t("volumes.countSingular")}
				</span>
			</div>
		</Card>
	);
}
