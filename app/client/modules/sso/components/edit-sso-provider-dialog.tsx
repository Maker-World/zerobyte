import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { pickBy } from "es-toolkit";
import { Pencil, RefreshCw, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
	checkSsoProviderDiscoveryOptions,
	getSsoProviderDetailsOptions,
	updateSsoProviderMutation,
} from "~/client/api-client/@tanstack/react-query.gen";
import { Alert, AlertAction, AlertContent, AlertDescription, AlertTitle } from "~/client/components/ui/alert";
import { Button } from "~/client/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/client/components/ui/dialog";
import { Input } from "~/client/components/ui/input";
import { Label } from "~/client/components/ui/label";
import type { SsoProviderDetails, SsoDiscoveryResult } from "~/lib/sso-configuration";
import { parseError } from "~/client/lib/errors";
import { getLinkedSsoProviderEditError, isSameIssuerExceptTrailingSlash } from "~/lib/sso-provider-identity";
import { useTranslation } from "~/client/lib/i18n";

function getUsableDiscoveredIssuer(provider: SsoProviderDetails, discovery?: SsoDiscoveryResult) {
	const discoveredIssuer = discovery?.discoveryIssuer;
	if (!discoveredIssuer) return null;
	if (!provider.hasLinkedAccounts) return discoveredIssuer;
	if (!isSameIssuerExceptTrailingSlash(provider.issuer, discoveredIssuer)) return null;

	return discoveredIssuer;
}

export function EditSsoProviderDialog({ providerId }: { providerId: string }) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const provider = useQuery({ ...getSsoProviderDetailsOptions({ path: { providerId } }), enabled: open });

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					title={t("sso.editSsoProviderDialog.edit", { providerId: providerId })}
					aria-label={t("sso.editSsoProviderDialog.edit", { providerId: providerId })}
				>
					<Pencil className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-2xl max-h-[90dvh] flex flex-col overflow-hidden">
				<DialogHeader>
					<DialogTitle>{t("sso.editSsoProviderDialog.editSsoProvider")}</DialogTitle>
					<DialogDescription>
						{t("sso.editSsoProviderDialog.updateWithoutRecreatingIt", { providerId: providerId })}
					</DialogDescription>
				</DialogHeader>
				{provider.isPending && (
					<output className="text-sm text-muted-foreground">
						{t("sso.editSsoProviderDialog.loadingSettings")}
					</output>
				)}
				{provider.isError && (
					<Alert variant="destructive">
						<AlertContent>
							<AlertDescription>
								{parseError(provider.error)?.message ?? t("sso.editSsoProviderDialog.couldNotLoadThis")}
							</AlertDescription>
						</AlertContent>
						<AlertAction>
							<Button type="button" variant="outline" onClick={() => void provider.refetch()}>
								{t("common.tryAgain")}
							</Button>
						</AlertAction>
					</Alert>
				)}
				{open && provider.data && <SsoProviderEditor provider={provider.data} onClose={() => setOpen(false)} />}
			</DialogContent>
		</Dialog>
	);
}

export function SsoProviderEditor({ provider, onClose }: { provider: SsoProviderDetails; onClose: () => void }) {
	const { t } = useTranslation();
	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { dirtyFields, isDirty },
	} = useForm({
		defaultValues: {
			issuer: provider.issuer,
			domain: provider.domain,
			discoveryEndpoint: provider.discoveryEndpoint,
			clientId: provider.clientId,
			clientSecret: "",
		},
	});

	const issuer = useWatch({ control, name: "issuer" });

	const discovery = useQuery({
		...checkSsoProviderDiscoveryOptions({ path: { providerId: provider.providerId } }),
		enabled: false,
		retry: false,
	});

	const update = useMutation({
		...updateSsoProviderMutation(),
		onSuccess: () => {
			toast.success(t("sso.editSsoProviderDialog.ssoProviderUpdated"));
			onClose();
		},
	});

	let identityChangeError: string | null = null;
	if (provider.hasLinkedAccounts) {
		identityChangeError = getLinkedSsoProviderEditError(provider, { issuer });
	}

	const discoveredIssuer = getUsableDiscoveredIssuer(provider, discovery.data);

	const copyCallbackUrl = async () => {
		try {
			await navigator.clipboard.writeText(provider.callbackUrl);
			toast.success(t("sso.editSsoProviderDialog.callbackUrlCopied"));
		} catch {
			toast.error(t("sso.editSsoProviderDialog.couldNotCopySelect"));
		}
	};

	const save = handleSubmit((values) => {
		const body = pickBy(values, (value, key) => !!dirtyFields[key] && value !== "");
		if (Object.keys(body).length === 0) return;

		update.mutate({ path: { providerId: provider.providerId }, body });
	});

	return (
		<form onSubmit={save} className="min-h-0 flex flex-col gap-5">
			<div className="min-h-0 space-y-5 overflow-y-auto pr-1">
				{provider.proxyMisconfigured && (
					<Alert variant="warning">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>{t("sso.editSsoProviderDialog.ssoIsGeneratingAn")}</AlertTitle>
						<AlertDescription>
							{t("sso.editSsoProviderDialog.enable")} <code>TRUST_PROXY=true</code>{" "}
							{t("sso.editSsoProviderDialog.andMakeSureYour")} <code>X-Forwarded-Proto: https</code>
							{t("sso.editSsoProviderDialog.restartZerobyteAfterChanging")}{" "}
							<span className="break-all font-mono">{provider.expectedCallbackUrl}</span>.
						</AlertDescription>
					</Alert>
				)}
				<div className="space-y-2">
					<Label htmlFor="sso-callback">{t("sso.editSsoProviderDialog.callbackUrlSentTo")}</Label>
					<div className="flex gap-2">
						<Input
							id="sso-callback"
							value={provider.callbackUrl}
							readOnly
							className="font-mono text-xs"
							onClick={(event) => event.currentTarget.select()}
						/>
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label={t("sso.editSsoProviderDialog.copyCallbackUrl")}
							onClick={() => void copyCallbackUrl()}
						>
							<Copy className="h-4 w-4" />
						</Button>
					</div>
					<p className="text-xs text-muted-foreground">
						{t("sso.editSsoProviderDialog.registerThisExactUrl")}
					</p>
				</div>
				{discovery.data?.discoveryStatus === "issuer_mismatch" && (
					<Alert variant="warning">
						<AlertContent>
							<AlertTriangle className="h-4 w-4" />
							<AlertTitle>{t("sso.editSsoProviderDialog.issuerUrlsDoNot")}</AlertTitle>
							<AlertDescription>
								{t("sso.editSsoProviderDialog.discoveryPublishes")}{" "}
								<span className="break-all font-mono">{discovery.data?.discoveryIssuer}</span>.{" "}
								{discovery.data?.discoveryMessage}
							</AlertDescription>
						</AlertContent>
						{discoveredIssuer && (
							<AlertAction>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setValue("issuer", discoveredIssuer, { shouldDirty: true })}
								>
									{t("sso.editSsoProviderDialog.useDiscoveredIssuer")}
								</Button>
							</AlertAction>
						)}
					</Alert>
				)}
				{discovery.isError && (
					<Alert variant="warning">
						<AlertDescription>
							{parseError(discovery.error)?.message ??
								t("sso.editSsoProviderDialog.couldNotCheckDiscovery")}
						</AlertDescription>
					</Alert>
				)}
				{discovery.data?.discoveryStatus === "unavailable" && (
					<Alert variant="warning">
						<AlertTitle>{t("sso.editSsoProviderDialog.discoveryCouldNotBe")}</AlertTitle>
						<AlertDescription>
							{t("sso.editSsoProviderDialog.youCanStillUpdate", {
								discoveryMessage: discovery.data?.discoveryMessage,
							})}
						</AlertDescription>
					</Alert>
				)}
				{discovery.data?.discoveryStatus === "ok" && (
					<p className="flex items-center gap-2 text-sm text-muted-foreground">
						<CheckCircle2 className="h-4 w-4 text-green-500" />
						{t("sso.editSsoProviderDialog.savedIssuerMatchesDiscovery")}
					</p>
				)}
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2 sm:col-span-2">
						<Label htmlFor="sso-edit-issuer">{t("sso.editSsoProviderDialog.issuerUrl")}</Label>
						<Input
							id="sso-edit-issuer"
							type="url"
							required
							{...register("issuer")}
							disabled={update.isPending}
						/>
						<p className="text-xs text-muted-foreground">
							{t("sso.editSsoProviderDialog.copyTheIssuerExactly")}
						</p>
					</div>
					<div className="space-y-2 sm:col-span-2">
						<Label htmlFor="sso-edit-discovery">{t("sso.editSsoProviderDialog.discoveryEndpoint")}</Label>
						<Input
							id="sso-edit-discovery"
							type="url"
							required
							{...register("discoveryEndpoint")}
							disabled={update.isPending || provider.hasLinkedAccounts}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="sso-edit-domain">{t("sso.editSsoProviderDialog.organizationDomain")}</Label>
						<Input id="sso-edit-domain" required {...register("domain")} disabled={update.isPending} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="sso-edit-client-id">{t("sso.editSsoProviderDialog.clientId")}</Label>
						<Input
							id="sso-edit-client-id"
							required
							{...register("clientId")}
							disabled={update.isPending || provider.hasLinkedAccounts}
						/>
					</div>
					<div className="space-y-2 sm:col-span-2">
						<Label htmlFor="sso-edit-secret">{t("sso.editSsoProviderDialog.clientSecret")}</Label>
						<Input
							id="sso-edit-secret"
							type="password"
							autoComplete="new-password"
							{...register("clientSecret")}
							placeholder={
								provider.hasClientSecret
									? t("sso.editSsoProviderDialog.leaveBlankToKeep")
									: t("sso.editSsoProviderDialog.enterAClientSecret")
							}
							disabled={update.isPending}
						/>
						<p className="text-xs text-muted-foreground">
							{t("sso.editSsoProviderDialog.theSavedSecretIs")}
						</p>
					</div>
				</div>
				{provider.hasLinkedAccounts && (
					<p className="text-xs text-muted-foreground">
						{t("sso.editSsoProviderDialog.thisProviderHasLinked")}
					</p>
				)}
				{identityChangeError && (
					<Alert variant="warning">
						<AlertDescription>{identityChangeError}</AlertDescription>
					</Alert>
				)}
				{update.isError && (
					<Alert variant="destructive">
						<AlertTitle>{t("sso.editSsoProviderDialog.changesCouldNotBe")}</AlertTitle>
						<AlertDescription>
							{parseError(update.error)?.message ?? t("sso.editSsoProviderDialog.pleaseTryAgain")}
						</AlertDescription>
					</Alert>
				)}
			</div>
			<DialogFooter className="gap-2 border-t pt-4 shrink-0">
				<Button
					type="button"
					variant="ghost"
					loading={discovery.isFetching}
					disabled={update.isPending}
					onClick={() => void discovery.refetch()}
				>
					<RefreshCw className="h-4 w-4 mr-2" />
					{t("sso.editSsoProviderDialog.checkSavedConfiguration")}
				</Button>
				<Button type="button" variant="outline" disabled={update.isPending} onClick={onClose}>
					{t("common.cancel")}
				</Button>
				<Button type="submit" loading={update.isPending} disabled={!isDirty || identityChangeError !== null}>
					{t("volumes.createVolumeForm.saveChanges")}
				</Button>
			</DialogFooter>
		</form>
	);
}
