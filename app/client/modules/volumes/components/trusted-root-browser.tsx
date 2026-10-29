import { useState } from "react";
import { DirectoryBrowser } from "~/client/components/file-browsers/directory-browser";
import { Button } from "~/client/components/ui/button";
import { cn } from "~/client/lib/utils";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	agentId: string;
	rootId: string;
	rootLabel: string;
	value: string | null;
	disabled?: boolean;
	onChange: (relativePath: string) => void;
};

export const TrustedRootBrowser = ({ agentId, rootId, rootLabel, value, disabled, onChange }: Props) => {
	const { t } = useTranslation();
	const [browsing, setBrowsing] = useState(false);

	const select = (relativePath: string) => {
		onChange(relativePath);
		setBrowsing(false);
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<div className="min-w-0 flex-1 text-sm font-mono bg-muted px-3 py-2 rounded-md border break-all">
					<span className={cn({ hidden: value !== null })}>
						{t("volumes.trustedRootBrowser.noFolderSelected")}
					</span>
					<span className={cn({ hidden: !value })}>
						{rootLabel}/{value}
					</span>
					<span className={cn({ hidden: value !== "" })}>
						{t("volumes.trustedRootBrowser.entire", { rootLabel: rootLabel })}
					</span>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={disabled}
					onClick={() => setBrowsing(!browsing)}
				>
					<span className={cn({ hidden: !browsing })}>{t("common.cancel")}</span>
					<span className={cn({ hidden: browsing || value !== null })}>
						{t("volumes.trustedRootBrowser.chooseFolder")}
					</span>
					<span className={cn({ hidden: browsing || value === null })}>
						{t("volumes.trustedRootBrowser.change")}
					</span>
				</Button>
			</div>
			{browsing && (
				<>
					<Button type="button" variant="outline" size="sm" onClick={() => select("")}>
						{t("volumes.trustedRootBrowser.selectEntireLocation")}
					</Button>
					<DirectoryBrowser
						trustedRoot={{ agentId, rootId }}
						selectedPath={value ? `/${value}` : undefined}
						onSelectPath={(path) => select(path.replace(/^\/+/, ""))}
					/>
				</>
			)}
		</div>
	);
};
