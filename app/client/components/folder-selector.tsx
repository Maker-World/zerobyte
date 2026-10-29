import { useState, type ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { DirectoryBrowser } from "./file-browsers/directory-browser";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { useIsDesktop } from "~/client/hooks/use-is-desktop";
import { useTranslation } from "~/client/lib/i18n";

type WebFolderBrowser = {
	mode?: "inline" | "dialog";
	title?: string;
	description?: ReactNode;
	warning?: {
		title: ReactNode;
		description: ReactNode;
		continueLabel?: string;
	};
};

type Props = {
	value: string;
	onChange: (path: string) => void;
	displayValue?: ReactNode;
	placeholder?: string;
	webBrowser?: WebFolderBrowser;
};

export const FolderSelector = ({
	value,
	onChange,
	displayValue,
	placeholder = "No folder selected",
	webBrowser,
}: Props) => {
	const { t } = useTranslation();
	const [showBrowser, setShowBrowser] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const isDesktop = useIsDesktop();
	const webBrowserMode = webBrowser?.mode ?? "inline";

	const chooseDesktopFolder = async () => {
		const desktop = window.zerobyteDesktop;
		if (!desktop) {
			toast.error(t("components.folderSelector.desktopFolderPickerIs"));
			return;
		}

		try {
			const path = await desktop.chooseFolder();
			if (path) {
				onChange(path);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to choose folder";
			toast.error(message);
		}
	};

	const openWebBrowser = () => {
		if (webBrowser?.warning) {
			setShowWarning(true);
			return;
		}

		setShowBrowser(true);
	};

	const selectWebFolder = (path: string) => {
		onChange(path);
		if (webBrowserMode === "inline") {
			setShowBrowser(false);
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<div className="flex-1 text-sm font-mono bg-muted px-3 py-2 rounded-md border break-all">
					{displayValue ?? (value || placeholder)}
				</div>
				<Button
					type="button"
					variant="outline"
					onClick={isDesktop ? chooseDesktopFolder : openWebBrowser}
					size="sm"
				>
					{isDesktop && <FolderOpen className="h-4 w-4 mr-2" />}
					{isDesktop ? t("components.folderSelector.choose") : t("volumes.trustedRootBrowser.change")}
				</Button>
			</div>

			{!isDesktop && webBrowserMode === "inline" && showBrowser && (
				<>
					<DirectoryBrowser selectedPath={value} onSelectPath={selectWebFolder} />
					<Button type="button" variant="ghost" size="sm" onClick={() => setShowBrowser(false)}>
						{t("common.cancel")}
					</Button>
				</>
			)}

			{!isDesktop && webBrowser?.warning && (
				<AlertDialog open={showWarning} onOpenChange={setShowWarning}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle className="flex items-center gap-2">
								{webBrowser.warning.title}
							</AlertDialogTitle>
							<AlertDialogDescription asChild>
								<div className="space-y-3">{webBrowser.warning.description}</div>
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									setShowBrowser(true);
									setShowWarning(false);
								}}
							>
								{webBrowser.warning.continueLabel ?? t("common.continue")}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}

			{!isDesktop && webBrowserMode === "dialog" && (
				<AlertDialog open={showBrowser} onOpenChange={setShowBrowser}>
					<AlertDialogContent className="max-w-2xl">
						<AlertDialogHeader>
							<AlertDialogTitle>
								{webBrowser?.title ?? t("components.folderSelector.selectFolder")}
							</AlertDialogTitle>
							<AlertDialogDescription>
								{webBrowser?.description ?? t("components.folderSelector.chooseADirectoryFrom")}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<div className="py-4">
							<DirectoryBrowser selectedPath={value} onSelectPath={selectWebFolder} />
						</div>
						<AlertDialogFooter>
							<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
							<AlertDialogAction onClick={() => setShowBrowser(false)}>
								{t("settings.apiKeysSection.done")}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</div>
	);
};
