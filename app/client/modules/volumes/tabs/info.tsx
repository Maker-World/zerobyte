import { useMemo } from "react";
import { FolderOpen, HardDrive, Laptop, Settings, Unplug } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { ByteSize } from "~/client/components/bytes-size";
import { Card, CardTitle } from "~/client/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/client/components/ui/chart";
import type { StatFs, Volume } from "~/client/lib/types";
import { cn } from "~/client/lib/utils";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	volume: Volume;
	statfs: StatFs;
};

const backendLabels: Record<Exclude<Volume["type"], null>, string> = {
	directory: "Directory",
	nfs: "NFS",
	smb: "SMB",
	webdav: "WebDAV",
	rclone: "rclone",
	sftp: "SFTP",
};

type ConfigRowProps = {
	icon: React.ReactNode;
	label: string;
	value: string;
	mono?: boolean;
};

function ConfigRow({ icon, label, value, mono }: ConfigRowProps) {
	return (
		<div className="flex flex-wrap items-start gap-3 py-3 first:pt-0 last:pb-0 sm:flex-nowrap sm:items-center">
			<span className="text-muted-foreground shrink-0">{icon}</span>
			<span className="w-[calc(100%-1.75rem)] shrink-0 text-sm text-muted-foreground sm:w-40">{label}</span>
			<span className={cn("min-w-0 text-sm break-all", { "font-mono bg-muted/50 px-2 py-0.5 rounded": mono })}>
				{value}
			</span>
		</div>
	);
}

function BackendConfigRows({ volume }: { volume: Volume }) {
	const { t } = useTranslation();
	if (volume.sourceKind === "filesystem") {
		return (
			<>
				<ConfigRow
					icon={<Laptop className="h-4 w-4" />}
					label={t("volumes.info.machine")}
					value={volume.sourceLocation.machine}
				/>
				<ConfigRow
					icon={<FolderOpen className="h-4 w-4" />}
					label={t("volumes.info.folder")}
					value={volume.sourceLocation.path}
					mono
				/>
			</>
		);
	}

	const config = volume.config;

	switch (config.backend) {
		case "directory":
			return (
				<ConfigRow
					icon={<FolderOpen className="h-4 w-4" />}
					label={t("volumes.info.directoryPath")}
					value={config.path}
					mono
				/>
			);
		case "nfs":
			return (
				<>
					<ConfigRow
						icon={<FolderOpen className="h-4 w-4" />}
						label={t("volumes.info.server")}
						value={config.server}
						mono
					/>
					<ConfigRow
						icon={<FolderOpen className="h-4 w-4" />}
						label={t("volumes.info.exportPath")}
						value={config.exportPath}
						mono
					/>
				</>
			);
		case "smb":
			return (
				<>
					<ConfigRow
						icon={<FolderOpen className="h-4 w-4" />}
						label={t("volumes.info.server")}
						value={config.server}
						mono
					/>
					<ConfigRow
						icon={<FolderOpen className="h-4 w-4" />}
						label={t("volumes.info.share")}
						value={config.share}
						mono
					/>
				</>
			);
		case "webdav":
			return (
				<>
					<ConfigRow
						icon={<FolderOpen className="h-4 w-4" />}
						label={t("volumes.info.server")}
						value={config.server}
						mono
					/>
					<ConfigRow
						icon={<FolderOpen className="h-4 w-4" />}
						label={t("volumes.info.path")}
						value={config.path}
						mono
					/>
				</>
			);
		case "rclone":
			return (
				<>
					<ConfigRow
						icon={<FolderOpen className="h-4 w-4" />}
						label={t("settings.machineRow.remote")}
						value={config.remote}
						mono
					/>
					<ConfigRow
						icon={<FolderOpen className="h-4 w-4" />}
						label={t("volumes.info.path")}
						value={config.path}
						mono
					/>
				</>
			);
		case "sftp":
			return (
				<>
					<ConfigRow
						icon={<FolderOpen className="h-4 w-4" />}
						label={t("volumes.info.host")}
						value={config.host}
						mono
					/>
					<ConfigRow
						icon={<FolderOpen className="h-4 w-4" />}
						label={t("auth.username")}
						value={config.username}
					/>
					<ConfigRow
						icon={<FolderOpen className="h-4 w-4" />}
						label={t("volumes.info.path")}
						value={config.path}
						mono
					/>
				</>
			);
	}
}

function DonutChart({ statfs }: { statfs: StatFs }) {
	const { t } = useTranslation();
	const { used = 0, total = 0 } = statfs;

	const chartData = useMemo(
		() => [
			{ name: "Used", value: statfs.used, fill: "var(--strong-accent)" },
			{ name: "Free", value: statfs.free, fill: "lightgray" },
		],
		[statfs],
	);

	const usagePercentage = useMemo(() => {
		return Math.round((used / total) * 100);
	}, [used, total]);

	return (
		<ChartContainer config={{}} className="mx-auto aspect-square max-h-[200px]">
			<PieChart>
				<ChartTooltip
					cursor={false}
					content={
						<ChartTooltipContent
							hideLabel
							formatter={(value, name) => [<ByteSize key={name} bytes={value as number} />, name]}
						/>
					}
				/>
				<Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={5}>
					<Label
						content={({ viewBox }) => {
							if (viewBox && "cx" in viewBox && "cy" in viewBox) {
								return (
									<text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
										<tspan
											x={viewBox.cx}
											y={viewBox.cy}
											className="fill-foreground text-2xl font-bold"
										>
											{usagePercentage}%
										</tspan>
										<tspan
											x={viewBox.cx}
											y={(viewBox.cy || 0) + 20}
											className="fill-muted-foreground text-xs"
										>
											{t("volumes.info.used")}
										</tspan>
									</text>
								);
							}
						}}
					/>
				</Pie>
			</PieChart>
		</ChartContainer>
	);
}

export const VolumeInfoTabContent = ({ volume, statfs }: Props) => {
	const { t } = useTranslation();
	const { total = 0, used = 0, free = 0 } = statfs;

	const hasStorage = total > 0;
	const backendLabel = volume.type === null ? t("volumes.filesystem") : backendLabels[volume.type];

	return (
		<Card className="px-6 py-6 @container/inner">
			<div
				className={cn(
					"grid grid-cols-1 gap-8",
					volume.sourceKind === "managed" && "@3xl/inner:grid-cols-[1fr_280px]",
				)}
			>
				<div>
					<CardTitle className="flex items-center gap-2 mb-5">
						<Settings className="h-4 w-4 text-muted-foreground" />
						{t("volumes.volumeDetails.configuration")}
					</CardTitle>
					<div className="space-y-0 divide-y divide-border/50">
						<ConfigRow
							icon={<HardDrive className="h-4 w-4" />}
							label={t("common.name")}
							value={volume.name}
						/>
						<ConfigRow
							icon={<HardDrive className="h-4 w-4" />}
							label={t("common.backend")}
							value={backendLabel}
						/>
						<BackendConfigRows volume={volume} />
					</div>
				</div>

				{volume.sourceKind === "managed" && hasStorage && (
					<div className="@3xl/inner:border-l @3xl/inner:border-border/50 @3xl/inner:pl-8">
						<CardTitle className="flex items-center gap-2 mb-2 text-center @3xl/inner:text-left">
							<HardDrive className="h-4 w-4" />
							{t("volumes.info.storage")}
						</CardTitle>
						<DonutChart statfs={statfs} />
						<div className="grid gap-2 mt-2">
							<div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
								<div className="flex items-center gap-3">
									<HardDrive className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm font-medium">{t("volumes.info.total")}</span>
								</div>
								<ByteSize bytes={total} className="font-mono text-sm" />
							</div>
							<div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
								<div className="flex items-center gap-3">
									<div className="h-3 w-3 rounded-full bg-strong-accent" />
									<span className="text-sm font-medium">{t("volumes.info.used")}</span>
								</div>
								<ByteSize bytes={used} className="font-mono text-sm" />
							</div>
							<div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
								<div className="flex items-center gap-3">
									<div className="h-3 w-3 rounded-full bg-primary" />
									<span className="text-sm font-medium">{t("volumes.info.free")}</span>
								</div>
								<ByteSize bytes={free} className="font-mono text-sm" />
							</div>
						</div>
					</div>
				)}
				{volume.sourceKind === "managed" && !hasStorage && (
					<div className="@3xl/inner:border-l @3xl/inner:border-border/50 @3xl/inner:pl-8 flex flex-col items-center justify-center text-center py-8">
						<Unplug className="mb-4 h-5 w-5 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							{t("volumes.info.noStorageDataAvailable")}
							<br />
							{t("volumes.info.mountTheSourceTo")}
						</p>
					</div>
				)}
			</div>
		</Card>
	);
};
