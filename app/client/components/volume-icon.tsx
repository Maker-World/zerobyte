import { Cloud, Folder, Server } from "lucide-react";
import type { BackendType } from "@zerobyte/contracts/volumes";
import { useTranslation } from "~/client/lib/i18n";

type VolumeIconProps = {
	backend: BackendType;
};

const getIconAndLabel = (backend: BackendType) => {
	switch (backend) {
		case "directory":
			return {
				icon: Folder,
				label: "Directory",
			};
		case "nfs":
			return {
				icon: Server,
				label: "NFS",
			};
		case "smb":
			return {
				icon: Server,
				label: "SMB",
			};
		case "webdav":
			return {
				icon: Server,
				label: "WebDAV",
			};
		case "rclone":
			return {
				icon: Cloud,
				label: "Rclone",
			};
		case "sftp":
			return {
				icon: Server,
				label: "SFTP",
			};
		default:
			return {
				icon: Folder,
				label: "Unknown",
			};
	}
};

export const VolumeIcon = ({ backend }: VolumeIconProps) => {
	const { t } = useTranslation();
	const { icon: Icon, label } = getIconAndLabel(backend);
	const displayLabel =
		label === "Directory" ? t("volumes.directory") : label === "Unknown" ? t("status.unknown") : label;

	return (
		<span className={`flex items-center gap-2 rounded-md py-1`}>
			<Icon className="h-4 w-4" />
			{displayLabel}
		</span>
	);
};
