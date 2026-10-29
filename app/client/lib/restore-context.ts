import { isRemoteSource } from "@zerobyte/contracts/backup-context";
import { findCommonAncestor, isPathWithin } from "@zerobyte/core/utils";
import type { Snapshot, Volume } from "./types";
import { getVolumeMountPath } from "./volume-path";
import type { TranslationKey } from "./i18n";

const UNAVAILABLE_REASONS = {
	remoteSource:
		"This snapshot's source is not on this server. Restore the files to a folder on this server, or download them.",
	pathMismatch:
		"This snapshot was created from source paths that do not match this Zerobyte server or the current linked volume. Restoring to the original location is unavailable. Restore it to a custom location, or download it instead.",
	readOnly:
		"The volume backing this backup is mounted read-only. Restoring to the original location is unavailable. Restore it to a custom location, or download it instead.",
} as const;

const unavailableReasonKeys: Record<string, TranslationKey> = {
	[UNAVAILABLE_REASONS.remoteSource]: "restoreContext.remoteSource",
	[UNAVAILABLE_REASONS.pathMismatch]: "restoreContext.pathMismatch",
	[UNAVAILABLE_REASONS.readOnly]: "restoreContext.readOnly",
};

export const getUnavailableReasonKey = (reason: string): TranslationKey | undefined => unavailableReasonKeys[reason];

export const getRestoreContext = (snapshot: Pick<Snapshot, "paths">, volume?: Volume) => {
	const hasNonPosixPaths = snapshot.paths.some((path) => !path.startsWith("/"));
	const queryBasePath = hasNonPosixPaths ? "/" : findCommonAncestor(snapshot.paths);
	const displayBasePath = volume ? getVolumeMountPath(volume) : undefined;

	let originalLocationUnavailableReason: string | null = null;
	if (!volume || isRemoteSource(volume)) {
		originalLocationUnavailableReason = UNAVAILABLE_REASONS.remoteSource;
	} else if (hasNonPosixPaths || (displayBasePath && !isPathWithin(displayBasePath, queryBasePath))) {
		originalLocationUnavailableReason = UNAVAILABLE_REASONS.pathMismatch;
	} else if (volume.config?.readOnly) {
		originalLocationUnavailableReason = UNAVAILABLE_REASONS.readOnly;
	}

	return { queryBasePath, displayBasePath, originalLocationUnavailableReason };
};
