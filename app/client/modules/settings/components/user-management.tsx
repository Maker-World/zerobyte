import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Shield, ShieldAlert, UserCheck, Trash2, Search, AlertTriangle, Ban, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "~/client/lib/auth-client";
import { Button } from "~/client/components/ui/button";
import { cn } from "~/client/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/client/components/ui/table";
import { Badge } from "~/client/components/ui/badge";
import { Input } from "~/client/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/client/components/ui/dialog";
import { CreateUserDialog } from "./create-user-dialog";
import {
	getAdminUsersOptions,
	getUserDeletionImpactOptions,
	deleteUserAccountMutation,
} from "~/client/api-client/@tanstack/react-query.gen";
import { useTranslation } from "~/client/lib/i18n";

export function UserManagement({ currentUser }: { currentUser: { id: string } | undefined | null }) {
	const { t } = useTranslation();
	const [search, setSearch] = useState("");
	const [userToDelete, setUserToDelete] = useState<string | null>(null);
	const [userToBan, setUserToBan] = useState<{ id: string; name: string; isBanned: boolean } | null>(null);
	const [userToManageAccounts, setUserToManageAccounts] = useState<{
		id: string;
		name: string;
		accounts: { id: string; providerId: string }[];
	}>();

	const { data: deletionImpact, isLoading: isLoadingImpact } = useQuery({
		...getUserDeletionImpactOptions({ path: { userId: userToDelete ?? "" } }),
		enabled: Boolean(userToDelete),
	});

	const { data } = useSuspenseQuery({ ...getAdminUsersOptions() });

	const setRoleMutation = useMutation({
		mutationFn: async ({ userId, role }: { userId: string; role: "user" | "admin" }) => {
			const { error } = await authClient.admin.setRole({ userId, role });
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success(t("settings.userManagement.userRoleUpdatedSuccessfully"));
		},
		onError: (error) => {
			toast.error(t("settings.orgMembersSection.failedToUpdateRole"), { description: error.message });
		},
	});

	const toggleBanUserMutation = useMutation({
		mutationFn: async ({ userId, ban }: { userId: string; ban: boolean }) => {
			let result;
			if (ban) {
				result = await authClient.admin.banUser({ userId });
			} else {
				result = await authClient.admin.unbanUser({ userId });
			}

			if (result.error) throw result.error;
		},
		onSuccess: () => {
			toast.success(t("settings.userManagement.userBanStatusUpdated"));
		},
		onMutate: () => {
			setUserToBan(null);
		},
		onError: (error) => {
			toast.error(t("settings.userManagement.failedToUpdateBan"), { description: error.message });
		},
	});

	const deleteUser = useMutation({
		mutationFn: async (userId: string) => {
			const { error } = await authClient.admin.removeUser({ userId });
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success(t("settings.userManagement.userDeletedSuccessfully"));
			setUserToDelete(null);
		},
		onError: (error) => {
			toast.error(t("settings.userManagement.failedToDeleteUser"), { description: error.message });
		},
	});

	const deleteAccount = useMutation({
		...deleteUserAccountMutation(),
		onSuccess: (_data, variables) => {
			toast.success(t("settings.userManagement.accountRemovedSuccessfully"));
			setUserToManageAccounts((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					accounts: prev.accounts.filter((a) => a.id !== variables.path.accountId),
				};
			});
		},
		onError: (error) => {
			toast.error(t("settings.userManagement.failedToRemoveAccount"), { description: error.message });
		},
	});

	const normalizedSearch = search.toLowerCase();
	const filteredUsers = data.users.filter((user) => {
		const name = user.name?.toLowerCase() ?? "";
		const email = user.email.toLowerCase();

		return name.includes(normalizedSearch) || email.includes(normalizedSearch);
	});

	return (
		<div className="space-y-4 p-6">
			<div className="flex items-center justify-between gap-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder={t("settings.userManagement.searchUsers")}
						className="pl-8"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<CreateUserDialog />
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t("settings.userManagement.user")}</TableHead>
							<TableHead>{t("settings.orgMembersSection.role")}</TableHead>
							<TableHead>{t("common.status")}</TableHead>
							<TableHead className="text-right">{t("common.actions")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow className={cn({ hidden: filteredUsers.length > 0 })}>
							<TableCell colSpan={4} className="h-24 text-center">
								{t("settings.userManagement.noUsersFound")}
							</TableCell>
						</TableRow>
						{filteredUsers.map((user) => {
							const displayName = user.name ?? user.email;
							const isCurrentUser = user.id === currentUser?.id;
							const isBanned = Boolean(user.banned);

							return (
								<TableRow key={user.id}>
									<TableCell>
										<div className="flex flex-col">
											<span className="font-medium">{displayName}</span>
											<span className="text-sm text-muted-foreground">{user.email}</span>
										</div>
									</TableCell>
									<TableCell>
										<Badge>{user.role}</Badge>
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={cn("text-red-500 border-red-500", { hidden: !isBanned })}
										>
											{t("settings.userManagement.banned")}
										</Badge>
										<Badge
											variant="outline"
											className={cn("bg-success/10 text-success", { hidden: isBanned })}
										>
											{t("status.active")}
										</Badge>
									</TableCell>
									<TableCell className="text-right">
										<div className={cn("flex justify-end gap-2")}>
											<Button
												variant="ghost"
												size="icon"
												title={t("settings.userManagement.demoteToUser")}
												className={cn({ hidden: user.role !== "admin" || isCurrentUser })}
												onClick={() =>
													setRoleMutation.mutate({ userId: user.id, role: "user" })
												}
											>
												<ShieldAlert className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												title={t("settings.orgMembersSection.promoteToAdmin")}
												className={cn({ hidden: user.role === "admin" || isCurrentUser })}
												onClick={() =>
													setRoleMutation.mutate({ userId: user.id, role: "admin" })
												}
											>
												<Shield className="h-4 w-4" />
											</Button>

											<Button
												variant="ghost"
												size="icon"
												title={t("settings.userManagement.unbanUser")}
												className={cn({ hidden: !isBanned || isCurrentUser })}
												onClick={() =>
													setUserToBan({ id: user.id, name: displayName, isBanned: true })
												}
											>
												<UserCheck className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												title={t("settings.userManagement.banUser")}
												className={cn({ hidden: isBanned || isCurrentUser })}
												onClick={() =>
													setUserToBan({ id: user.id, name: displayName, isBanned: false })
												}
											>
												<Ban className="h-4 w-4" />
											</Button>

											<Button
												variant="ghost"
												size="icon"
												title={t("settings.userManagement.deleteUser")}
												className={cn({ hidden: isCurrentUser })}
												onClick={() => setUserToDelete(user.id)}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>

											<Button
												variant="ghost"
												size="icon"
												title={t("settings.userManagement.manageAccounts")}
												onClick={() =>
													setUserToManageAccounts({
														id: user.id,
														name: displayName,
														accounts: user.accounts,
													})
												}
											>
												<KeyRound className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>

			<Dialog open={Boolean(userToDelete)} onOpenChange={(open) => !open && setUserToDelete(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("settings.userManagement.areYouAbsolutelySure")}</DialogTitle>
						<DialogDescription>{t("settings.userManagement.thisActionCannotBe")}</DialogDescription>
					</DialogHeader>

					<div className={cn("space-y-4", { hidden: !deletionImpact?.organizations.length })}>
						<div className="flex items-start gap-3 p-3 text-sm border rounded-lg bg-destructive/10 border-destructive/20 text-destructive">
							<AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
							<div className="space-y-1">
								<p className="font-semibold">{t("settings.userManagement.importantDataDeletion")}</p>
								<p>{t("settings.userManagement.theFollowingPersonalOrganizations")}</p>
							</div>
						</div>

						<div className="space-y-3 overflow-y-auto max-h-48">
							{deletionImpact?.organizations.map((org) => (
								<div key={org.id} className="p-3 border rounded-md bg-muted/50">
									<p className="font-medium">{org.name}</p>
									<div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
										<span>
											{t("settings.userManagement.volumes", {
												volumesCount: org.resources.volumesCount,
											})}
										</span>
										<span>
											{t("settings.userManagement.repositories", {
												repositoriesCount: org.resources.repositoriesCount,
											})}
										</span>
										<span>
											{t("settings.userManagement.backups", {
												backupSchedulesCount: org.resources.backupSchedulesCount,
											})}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className={cn("text-center py-4", { hidden: !isLoadingImpact })}>
						<p className="text-sm text-muted-foreground">
							{t("settings.userManagement.analyzingDeletionImpact")}
						</p>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setUserToDelete(null)}>
							{t("common.cancel")}
						</Button>
						<Button
							variant="destructive"
							disabled={isLoadingImpact || deleteUser.isPending}
							onClick={() => deleteUser.mutate(userToDelete!)}
						>
							{t("settings.userManagement.deleteUser")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={Boolean(userToBan)} onOpenChange={(open) => !open && setUserToBan(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{userToBan?.isBanned
								? t("settings.userManagement.unban")
								: t("settings.userManagement.ban")}{" "}
							{t("settings.userManagement.user")}
						</DialogTitle>
						<DialogDescription>
							{userToBan?.isBanned
								? t("settings.userManagement.confirmUnban", { name: userToBan?.name ?? "" })
								: t("settings.userManagement.confirmBan", { name: userToBan?.name ?? "" })}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setUserToBan(null)}>
							{t("common.cancel")}
						</Button>
						<Button
							variant="default"
							className={cn({ hidden: !userToBan?.isBanned })}
							onClick={() => toggleBanUserMutation.mutate({ userId: userToBan?.id ?? "", ban: false })}
						>
							{t("settings.userManagement.unbanUser2")}
						</Button>
						<Button
							variant="destructive"
							className={cn({ hidden: Boolean(userToBan?.isBanned) })}
							onClick={() => toggleBanUserMutation.mutate({ userId: userToBan?.id ?? "", ban: true })}
						>
							{t("settings.userManagement.banUser2")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={Boolean(userToManageAccounts)}
				onOpenChange={(open) => !open && setUserToManageAccounts(undefined)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("settings.userManagement.manageAccounts")}</DialogTitle>
						<DialogDescription>
							{t("settings.userManagement.linkedAuthenticationAccountsFor", {
								name: userToManageAccounts?.name,
							})}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-2">
						<p
							className={cn("text-sm text-muted-foreground text-center py-4", {
								hidden: userToManageAccounts?.accounts.length,
							})}
						>
							{t("settings.userManagement.noAccountsLinked")}
						</p>
						{userToManageAccounts?.accounts.map((account) => (
							<div key={account.id} className="flex items-center justify-between p-3 border rounded-md">
								<span className="text-sm font-medium">{account.providerId}</span>
								<Button
									variant="ghost"
									size="icon"
									title={t("settings.userManagement.removeAccount")}
									disabled={deleteAccount.isPending}
									onClick={() =>
										deleteAccount.mutate({
											path: { userId: userToManageAccounts.id, accountId: account.id },
										})
									}
								>
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
							</div>
						))}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setUserToManageAccounts(undefined)}>
							{t("common.close")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
