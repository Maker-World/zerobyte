import { useMutation, useQuery } from "@tanstack/react-query";
import { KeyRound, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	createApiKeyMutation,
	deleteApiKeyMutation,
	getApiKeysOptions,
} from "~/client/api-client/@tanstack/react-query.gen";
import type { GetApiKeysResponse } from "~/client/api-client/types.gen";
import { Alert, AlertDescription, AlertTitle } from "~/client/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/client/components/ui/alert-dialog";
import { Button } from "~/client/components/ui/button";
import { CardContent, CardDescription, CardTitle } from "~/client/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/client/components/ui/dialog";
import { Input } from "~/client/components/ui/input";
import { Label } from "~/client/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/client/components/ui/table";
import { useTimeFormat } from "~/client/lib/datetime";
import { cn } from "~/client/lib/utils";
import { parseError } from "~/client/lib/errors";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	passwordAuthSupported: boolean;
	hasPassword: boolean;
};

type ApiKey = GetApiKeysResponse["apiKeys"][number];

const EXPIRATION_OPTIONS = [
	{ value: "30", label: "settings.apiKeysSection.expiration30Days" },
	{ value: "90", label: "settings.apiKeysSection.expiration90Days" },
	{ value: "365", label: "settings.apiKeysSection.expiration1Year" },
	{ value: "never", label: "settings.apiKeysSection.noExpiration" },
] as const;

type ExpirationValue = (typeof EXPIRATION_OPTIONS)[number]["value"];

export function ApiKeysSection({ passwordAuthSupported, hasPassword }: Props) {
	const { t } = useTranslation();
	const { formatDateTime } = useTimeFormat();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [newKeyName, setNewKeyName] = useState("");
	const [newKeyExpiration, setNewKeyExpiration] = useState<ExpirationValue>("365");
	const [password, setPassword] = useState("");
	const [createdKey, setCreatedKey] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);

	const { data, isPending } = useQuery(getApiKeysOptions());
	const apiKeys = data?.apiKeys ?? [];
	const limit = data?.limit ?? 50;
	const canCreateApiKey = !passwordAuthSupported || hasPassword;

	const createKey = useMutation({
		...createApiKeyMutation(),
		onSuccess: (apiKey) => {
			toast.success(t("settings.apiKeysSection.apiKeyCreated"));
			setCreatedKey(apiKey.key);
			setNewKeyName("");
			setPassword("");
		},
		onError: (error) => {
			toast.error(t("settings.apiKeysSection.failedToCreateApi"), { description: parseError(error)?.message });
		},
	});

	const deleteKey = useMutation({
		...deleteApiKeyMutation(),
		onSuccess: () => {
			toast.success(t("settings.apiKeysSection.apiKeyRevoked"));
			setDeleteTarget(null);
		},
		onError: (error) => {
			toast.error(t("settings.apiKeysSection.failedToRevokeApi"), { description: error.message });
		},
	});

	const closeCreateDialog = () => {
		setCreateDialogOpen(false);
		setNewKeyName("");
		setNewKeyExpiration("365");
		setPassword("");
		setCreatedKey(null);
	};

	const handleCreate = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		const name = newKeyName.trim();
		if (!name) {
			toast.error(t("settings.apiKeysSection.nameIsRequired"));
			return;
		}

		if (passwordAuthSupported && !password) {
			toast.error(t("auth.passwordRequired"));
			return;
		}

		const expiresIn = newKeyExpiration === "never" ? null : Number(newKeyExpiration) * 24 * 60 * 60;
		createKey.mutate({ body: { name, password: passwordAuthSupported ? password : "", expiresIn } });
	};

	return (
		<>
			<div className="border-t border-border/50 bg-card-header p-6">
				<CardTitle className="flex items-center gap-2">
					<KeyRound className="size-5" />
					{t("settings.apiKeysSection.apiKeys")}
				</CardTitle>
				<CardDescription className="mt-1.5">{t("settings.apiKeysSection.createKeysForApi")}</CardDescription>
			</div>
			<CardContent className="p-6 space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1">
						<p className="text-sm font-medium">
							{t("settings.apiKeysSection.activeKeysForThis", { length: apiKeys.length })}
						</p>
						<p className="text-xs text-muted-foreground">
							{t("settings.apiKeysSection.limitActiveKeysPer", { limit: limit })}
						</p>
					</div>
					<Button type="button" disabled={!canCreateApiKey} onClick={() => setCreateDialogOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						{t("settings.apiKeysSection.createKey")}
					</Button>
				</div>

				<Alert variant="warning" className={cn({ hidden: !passwordAuthSupported || hasPassword })}>
					<KeyRound className="size-5" />
					<AlertTitle>{t("recoveryKey.localPasswordRequired")}</AlertTitle>
					<AlertDescription>{t("settings.apiKeysSection.aLocalPasswordIs")}</AlertDescription>
				</Alert>

				<p className={cn("text-sm text-muted-foreground", { hidden: !isPending })}>
					{t("settings.apiKeysSection.loadingApiKeys")}
				</p>
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t("common.name")}</TableHead>
								<TableHead>{t("taskLog.created")}</TableHead>
								<TableHead>{t("settings.apiKeysSection.expires")}</TableHead>
								<TableHead>{t("settings.apiKeysSection.lastUsed")}</TableHead>
								<TableHead className="text-right">{t("common.actions")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow className={cn({ hidden: isPending || apiKeys.length > 0 })}>
								<TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
									{t("settings.apiKeysSection.noApiKeysYet")}
								</TableCell>
							</TableRow>
							{apiKeys.map((apiKey) => (
								<TableRow key={apiKey.id}>
									<TableCell className="font-medium">
										{apiKey.name ?? t("settings.apiKeysSection.unnamedKey")}
									</TableCell>
									<TableCell>{formatDateTime(new Date(apiKey.createdAt))}</TableCell>
									<TableCell>
										{apiKey.expiresAt
											? formatDateTime(new Date(apiKey.expiresAt))
											: t("time.never")}
									</TableCell>
									<TableCell>
										<span className={cn({ hidden: !apiKey.lastRequestAt })}>
											{apiKey.lastRequestAt && formatDateTime(new Date(apiKey.lastRequestAt))}
										</span>
										<span className={cn({ hidden: !!apiKey.lastRequestAt })}>
											{t("time.never")}
										</span>
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											size="icon"
											title={t("settings.apiKeysSection.revokeApiKey")}
											aria-label={t("settings.apiKeysSection.revokeApiKey3", {
												value: apiKey.name ?? "Unnamed key",
											})}
											onClick={() => setDeleteTarget(apiKey)}
										>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>

			<Dialog
				open={createDialogOpen}
				onOpenChange={(open) => {
					if (open) setCreateDialogOpen(true);
					else closeCreateDialog();
				}}
			>
				<DialogContent>
					<form onSubmit={handleCreate} className="min-w-0">
						<DialogHeader>
							<DialogTitle>
								{createdKey
									? t("settings.apiKeysSection.apiKeyCreated")
									: t("settings.apiKeysSection.createApiKey")}
							</DialogTitle>
							<DialogDescription>
								<span className={cn({ hidden: !createdKey })}>
									{t("settings.apiKeysSection.saveThisKeyNow")}
								</span>
								<span className={cn({ hidden: !!createdKey })}>
									{t("settings.apiKeysSection.theKeyIsShown")}
								</span>
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className={cn("space-y-2", { hidden: Boolean(createdKey) })}>
								<Label htmlFor="api-key-name">{t("common.name")}</Label>
								<Input
									id="api-key-name"
									value={newKeyName}
									onChange={(event) => setNewKeyName(event.target.value)}
									maxLength={32}
									required
								/>
							</div>
							<div className={cn("space-y-2", { hidden: Boolean(createdKey) })}>
								<Label htmlFor="api-key-expiration">{t("settings.apiKeysSection.expiration")}</Label>
								<Select
									value={newKeyExpiration}
									onValueChange={(value) => setNewKeyExpiration(value as ExpirationValue)}
								>
									<SelectTrigger id="api-key-expiration">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{EXPIRATION_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{t(option.label)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className={cn("space-y-2", { hidden: Boolean(createdKey) || !passwordAuthSupported })}>
								<Label htmlFor="api-key-password">{t("settings.apiKeysSection.currentPassword")}</Label>
								<Input
									id="api-key-password"
									type="password"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									required={passwordAuthSupported}
								/>
							</div>
							<div className={cn("min-w-0", { hidden: !createdKey })}>
								<div className="min-w-0 space-y-2">
									<Label htmlFor="created-api-key">{t("settings.apiKeysSection.apiKey")}</Label>
									<Input
										id="created-api-key"
										type="text"
										readOnly
										value={createdKey ?? ""}
										className="font-mono text-sm"
										onClick={(e) => e.currentTarget.select()}
									/>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button type="button" onClick={closeCreateDialog} className={cn({ hidden: !createdKey })}>
								{t("settings.apiKeysSection.done")}
							</Button>
							<span className={cn("flex items-center gap-2", { hidden: Boolean(createdKey) })}>
								<Button type="button" variant="outline" onClick={closeCreateDialog}>
									<X className="h-4 w-4 mr-2" />
									{t("common.cancel")}
								</Button>
								<Button type="submit" loading={createKey.isPending}>
									<KeyRound className="h-4 w-4 mr-2" />
									{t("common.create")}
								</Button>
							</span>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("settings.apiKeysSection.revokeApiKey2")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("settings.apiKeysSection.thisWillRevoke", {
								name: deleteTarget?.name ?? t("settings.apiKeysSection.thisKey"),
							})}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteKey.isPending}>{t("common.cancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								event.preventDefault();
								if (deleteTarget) {
									deleteKey.mutate({ path: { keyId: deleteTarget.id } });
								}
							}}
							disabled={deleteKey.isPending}
						>
							{t("settings.apiKeysSection.revoke")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
