import { EditSsoProviderDialog } from "./edit-sso-provider-dialog";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Ban, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	deleteSsoInvitationMutation,
	deleteSsoProviderMutation,
	getSsoSettingsOptions,
	updateSsoProviderAutoLinkingMutation,
} from "~/client/api-client/@tanstack/react-query.gen";
import type { GetSsoSettingsResponse } from "~/client/api-client/types.gen";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/client/components/ui/alert-dialog";
import { Alert, AlertDescription } from "~/client/components/ui/alert";
import { Button } from "~/client/components/ui/button";
import { Input } from "~/client/components/ui/input";
import { Label } from "~/client/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import { Switch } from "~/client/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/client/components/ui/table";
import { useOrganizationContext } from "~/client/hooks/use-org-context";
import { useTimeFormat } from "~/client/lib/datetime";
import { getOrigin } from "~/client/functions/get-origin";
import { authClient } from "~/client/lib/auth-client";
import { cn } from "~/client/lib/utils";
import { parseError } from "~/client/lib/errors";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "~/client/lib/i18n";

type InvitationRole = "member" | "admin" | "owner";

type Props = {
	initialSettings?: GetSsoSettingsResponse;
	initialOrigin?: string;
};

export function SsoSettingsSection({ initialSettings, initialOrigin }: Props) {
	const { t } = useTranslation();
	const originQuery = useServerFn(getOrigin);
	const { data } = useSuspenseQuery({ queryKey: ["app-origin"], queryFn: originQuery, initialData: initialOrigin });

	const navigate = useNavigate();
	const { formatDateWithMonth } = useTimeFormat();
	const { activeOrganization } = useOrganizationContext();
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<InvitationRole>("member");

	const ssoSettingsQuery = useSuspenseQuery({ ...getSsoSettingsOptions(), initialData: initialSettings });

	const updateProviderAutoLinkingMutation = useMutation({
		...updateSsoProviderAutoLinkingMutation(),
		onSuccess: (_, v) => {
			let message = "Automatic account linking disabled";
			if (v.body?.enabled) message = "Automatic account linking enabled";

			toast.success(message);
		},
		onError: (error) => {
			toast.error(t("sso.ssoSettingsSection.failedToUpdateProvider"), {
				description: parseError(error)?.message,
			});
		},
	});

	const deleteProviderMutation = useMutation({
		...deleteSsoProviderMutation(),
		onSuccess: () => {
			toast.success(t("sso.ssoSettingsSection.ssoProviderDeleted"));
		},
		onError: (error) => {
			toast.error(t("sso.ssoSettingsSection.failedToDeleteProvider"), { description: error.message });
		},
	});

	const inviteMemberMutation = useMutation({
		mutationFn: async () => {
			if (!activeOrganization) {
				throw new Error("No active organization found in session");
			}

			const normalizedEmail = inviteEmail.trim().toLowerCase();
			if (!normalizedEmail) {
				throw new Error("Email is required");
			}

			const { error } = await authClient.organization.inviteMember({
				email: normalizedEmail,
				role: inviteRole,
				organizationId: activeOrganization.id,
			});

			if (error) {
				throw error;
			}
		},
		onSuccess: () => {
			toast.success(t("sso.ssoSettingsSection.invitationCreated"));
			setInviteEmail("");
			setInviteRole("member");
		},
		onError: (error) => {
			toast.error(t("sso.ssoSettingsSection.failedToCreateInvitation"), { description: error.message });
		},
	});

	const cancelInvitationMutation = useMutation({
		mutationFn: async (invitationId: string) => {
			const { error } = await authClient.organization.cancelInvitation({ invitationId });
			if (error) {
				throw error;
			}
		},
		onSuccess: () => {
			toast.success(t("sso.ssoSettingsSection.invitationCancelled"));
		},
		onError: (error) => {
			toast.error(t("sso.ssoSettingsSection.failedToCancelInvitation"), { description: error.message });
		},
	});

	const deleteInvitationMutation = useMutation({
		...deleteSsoInvitationMutation(),
		onSuccess: () => {
			toast.success(t("sso.ssoSettingsSection.invitationDeleted"));
		},
		onError: (error) => {
			toast.error(t("sso.ssoSettingsSection.failedToDeleteInvitation"), { description: error.message });
		},
	});

	const providers = ssoSettingsQuery.data.providers;
	const invitations = ssoSettingsQuery.data.invitations;

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<div className="flex items-center justify-between gap-3">
					<div className="space-y-1">
						<p className="text-sm font-medium">{t("sso.ssoSettingsSection.registeredProviders")}</p>
						<p className="text-xs text-muted-foreground">
							{t("sso.ssoSettingsSection.manageIdentityProvidersUsed")}
						</p>
					</div>

					<Button
						type="button"
						disabled={!activeOrganization}
						onClick={() => void navigate({ to: "/settings/sso/new" })}
					>
						{t("sso.ssoSettingsSection.registerNew")}
					</Button>
				</div>

				<Alert variant="warning">
					<AlertDescription>{t("sso.ssoSettingsSection.onlyEnableAutomaticAccount")}</AlertDescription>
				</Alert>

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t("sso.ssoSettingsSection.providerId")}</TableHead>
								<TableHead>{t("sso.ssoSettingsSection.domain")}</TableHead>
								<TableHead>{t("sso.ssoSettingsSection.issuer")}</TableHead>
								<TableHead>{t("common.type")}</TableHead>
								<TableHead>{t("sso.ssoSettingsSection.autoLinkExistingAccount")}</TableHead>
								<TableHead>{t("sso.ssoSettingsSection.callbackUrl")}</TableHead>
								<TableHead className="text-right">{t("common.actions")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{providers.map((provider) => (
								<TableRow key={provider.providerId}>
									<TableCell className="font-medium">
										<div className="flex items-center gap-2">{provider.providerId}</div>
									</TableCell>
									<TableCell>{provider.domain}</TableCell>
									<TableCell className="break-all">{provider.issuer}</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<span className="uppercase text-xs font-medium px-2 py-0.5 rounded border">
												{provider.type}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Switch
												checked={provider.autoLinkMatchingEmails}
												disabled={updateProviderAutoLinkingMutation.isPending}
												onCheckedChange={(enabled) => {
													updateProviderAutoLinkingMutation.mutate({
														path: { providerId: provider.providerId },
														body: { enabled },
													});
												}}
											/>
											<span className="text-xs text-muted-foreground">
												{provider.autoLinkMatchingEmails
													? t("sso.ssoSettingsSection.on")
													: t("repositories.createRepositoryForm.off")}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<Input
											type="text"
											readOnly
											value={`${data}/api/auth/sso/callback/${provider.providerId}`}
											className="h-8 max-w-62.5 font-mono text-xs text-muted-foreground"
											onClick={(e) => e.currentTarget.select()}
										/>
									</TableCell>
									<TableCell className="text-right">
										{provider.type === "oidc" && (
											<EditSsoProviderDialog providerId={provider.providerId} />
										)}
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													title={t("sso.ssoSettingsSection.deleteProvider")}
													loading={deleteProviderMutation.isPending}
													disabled={deleteProviderMutation.isPending}
												>
													<Trash2 className="h-4 w-4 text-destructive" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														{t("sso.ssoSettingsSection.deleteSsoProvider")}
													</AlertDialogTitle>
													<AlertDialogDescription>
														{t("sso.ssoSettingsSection.areYouSureYou")}{" "}
														<strong>{provider.providerId}</strong>
														{t("volumes.volumeDetails.thisActionCannotBe")}
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
													<AlertDialogAction
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														onClick={() =>
															deleteProviderMutation.mutate({
																path: { providerId: provider.providerId },
															})
														}
													>
														{t("settings.passkeysSection.delete")}
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</TableCell>
								</TableRow>
							))}
							<TableRow className={cn({ hidden: providers.length > 0 })}>
								<TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
									{t("sso.ssoSettingsSection.noProvidersRegisteredYet")}
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
			</div>

			<div className="space-y-4 border-t border-border/50 pt-6">
				<div className="space-y-1.5">
					<p className="text-sm font-medium">{t("sso.ssoSettingsSection.inviteOnlyAccess")}</p>
					<p className="text-xs text-muted-foreground">{t("sso.ssoSettingsSection.usersMustBeInvited")}</p>
				</div>

				<div className="grid gap-3 @md:grid-cols-[minmax(0,1fr)_180px_auto]">
					<div className="space-y-2">
						<Label htmlFor="invite-email">{t("auth.email")}</Label>
						<Input
							id="invite-email"
							type="email"
							value={inviteEmail}
							onChange={(event) => setInviteEmail(event.target.value)}
							placeholder={t("sso.ssoSettingsSection.teammateExampleCom")}
							disabled={!activeOrganization || inviteMemberMutation.isPending}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="invite-role">{t("settings.orgMembersSection.role")}</Label>
						<Select
							value={inviteRole}
							onValueChange={(value) => setInviteRole(value as InvitationRole)}
							disabled={!activeOrganization || inviteMemberMutation.isPending}
						>
							<SelectTrigger id="invite-role">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="member">{t("settings.orgMembersSection.member")}</SelectItem>
								<SelectItem value="admin">{t("settings.createUserDialog.admin")}</SelectItem>
								<SelectItem value="owner">{t("sso.ssoSettingsSection.owner")}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-end">
						<Button
							type="button"
							loading={inviteMemberMutation.isPending}
							onClick={() => inviteMemberMutation.mutate()}
							disabled={!activeOrganization}
						>
							{t("sso.ssoSettingsSection.invite")}
						</Button>
					</div>
				</div>

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t("auth.email")}</TableHead>
								<TableHead>{t("settings.orgMembersSection.role")}</TableHead>
								<TableHead>{t("common.status")}</TableHead>
								<TableHead>{t("settings.apiKeysSection.expires")}</TableHead>
								<TableHead className="text-right">{t("common.actions")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{invitations.map((invitation) => (
								<TableRow key={invitation.id}>
									<TableCell className="font-medium">{invitation.email}</TableCell>
									<TableCell className="uppercase">{invitation.role}</TableCell>
									<TableCell>
										<span
											className={cn(`text-xs font-medium px-2 py-0.5 rounded border`, {
												"bg-primary/10 border-primary/20": invitation.status === "pending",
												"bg-muted border-muted-foreground/20": invitation.status !== "pending",
											})}
										>
											{invitation.status}
										</span>
									</TableCell>
									<TableCell>{formatDateWithMonth(invitation.expiresAt)}</TableCell>
									<TableCell className="text-right">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											title={t("sso.ssoSettingsSection.cancelInvitation")}
											loading={cancelInvitationMutation.isPending}
											disabled={cancelInvitationMutation.isPending}
											onClick={() => cancelInvitationMutation.mutate(invitation.id)}
											className={cn({ hidden: invitation.status !== "pending" })}
										>
											<Ban className="h-4 w-4" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											title={t("sso.ssoSettingsSection.deleteInvitation")}
											loading={deleteInvitationMutation.isPending}
											disabled={deleteInvitationMutation.isPending}
											onClick={() =>
												deleteInvitationMutation.mutate({
													path: { invitationId: invitation.id },
												})
											}
											className={cn({ hidden: invitation.status === "pending" })}
										>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									</TableCell>
								</TableRow>
							))}
							<TableRow className={cn({ hidden: invitations.length > 0 })}>
								<TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
									{t("sso.ssoSettingsSection.noInvitationsYet")}
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}
