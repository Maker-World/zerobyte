import { LocalFileBrowser, type TrustedRootRef } from "./local-file-browser";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	onSelectPath: (path: string) => void;
	selectedPath?: string;
	trustedRoot?: TrustedRootRef;
};

export const DirectoryBrowser = ({ onSelectPath, selectedPath, trustedRoot }: Props) => {
	const { t } = useTranslation();
	return (
		<LocalFileBrowser
			trustedRoot={trustedRoot}
			className="border rounded-lg overflow-hidden"
			useScrollArea
			scrollAreaClassName="h-64"
			foldersOnly
			selectableFolders
			selectedFolder={selectedPath}
			onFolderSelect={onSelectPath}
			showSelectedPathFooter
			selectedPath={selectedPath}
			loadingMessage={t("components.directoryBrowser.loadingDirectories")}
			emptyMessage={t("components.directoryBrowser.noSubdirectoriesFound")}
		/>
	);
};
