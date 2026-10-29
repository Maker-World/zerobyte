import { FolderOpen } from "lucide-react";
import { VolumeFileBrowser } from "~/client/components/file-browsers/volume-file-browser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/client/components/ui/card";
import type { Volume } from "~/client/lib/types";
import { cn } from "~/client/lib/utils";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	volume: Volume;
};

export const FilesTabContent = ({ volume }: Props) => {
	const { t } = useTranslation();
	if (volume.status !== "mounted") {
		const canMount = volume.sourceKind === "managed" && volume.type !== "directory";

		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center text-center py-12">
					<FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
					<div className={cn({ hidden: !canMount })}>
						<p className="text-muted-foreground">{t("volumes.files.sourceMustBeMounted")}</p>
						<p className="text-sm text-muted-foreground mt-2">{t("volumes.files.mountTheSourceTo")}</p>
					</div>
					<div className={cn({ hidden: canMount })}>
						<p className="text-muted-foreground">{t("volumes.files.directoryIsNotAccessible")}</p>
						<p className="text-sm text-muted-foreground mt-2">{t("volumes.files.makeSureTheFolder")}</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-[600px] flex flex-col">
			<CardHeader>
				<CardTitle>{t("volumes.files.fileExplorer")}</CardTitle>
				<CardDescription>{t("volumes.files.browseTheFilesAnd")}</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 overflow-hidden flex flex-col">
				<VolumeFileBrowser
					volumeId={volume.shortId}
					enabled={volume.status === "mounted"}
					className="overflow-auto flex-1 border rounded-md bg-card p-2"
					emptyMessage={t("volumes.files.thisSourceIsEmpty")}
					emptyDescription="Files and folders will appear here once you add them."
				/>
			</CardContent>
		</Card>
	);
};
