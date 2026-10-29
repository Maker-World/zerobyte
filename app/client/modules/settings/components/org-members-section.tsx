import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Shield, ShieldAlert, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	getOrgMembersOptions,
	removeOrgMemberMutation,
	updateMemberRoleMutation,
} from "~/client/api-client/@tanstack/react-query.gen";
import type { GetOrgMembersResponse } from "~/client/api-client/types.gen";
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
import { Badge } from "~/client/components/ui/badge";
import { Button } from "~/client/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/client/components/ui/table";
import { useOrganizationContext } from "~/client/hooks/use-org-context";
import { cn } from "~/client/lib/utils";
import { parseError } from "~/client/lib/errors";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	initialMembers?: GetOrgMembersResponse;
};

export function OrgMembersSection({ initialMembers }: Props) {
	const { t } = useTranslation();
	const { activeMember } = useOrganizationContext();
	const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);

	const {
		data: { members },
	} = useSuspenseQuery({ ...getOrgMembersOptions(), initialData: initialMembers });

	const updateRole = useMutation({
		...updateMemberRoleMutation(),
		onSuccess: () => {
			toast.success(t("settings.orgMembersSection.memberRoleUpdated"));
		},
		onError: (error) => {
			toast.error(t("settings.orgMembersSection.failedToUpdateRole"), {
				description: parseError(error)?.message,
			});
		},
	});

	const removeMember = useMutation({
		...removeOrgMemberMutation(),
		onSuccess: () => {
			toast.success(t("settings.orgMembersSection.memberRemovedFromOrganization"));
			setMemberToRemove(null);
		},
		onError: (error) => {
			toast.error(t("settings.orgMembersSection.failedToRemoveMember"), { description: error.message });
		},
	});

	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t("settings.orgMembersSection.member")}</TableHead>
							<TableHead>{t("settings.orgMembersSection.role")}</TableHead>
							<TableHead className="text-right">{t("common.actions")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow className={cn({ hidden: members.length > 0 })}>
							<TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
								{t("settings.orgMembersSection.noMembersFound")}
							</TableCell>
						</TableRow>
						{members.map((member) => {
							const isOwner = member.role === "owner";
							const isSelf = member.id === activeMember?.id;

							return (
								<TableRow key={member.id}>
									<TableCell>
										<div className="flex flex-col">
											<span className="font-medium">{member.user.name ?? member.user.email}</span>
											<span className="text-sm text-muted-foreground">{member.user.email}</span>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="outline">{member.role}</Badge>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="icon"
												title={t("settings.orgMembersSection.demoteToMember")}
												className={cn({ hidden: member.role !== "admin" || isSelf })}
												disabled={updateRole.isPending}
												onClick={() =>
													updateRole.mutate({
														path: { memberId: member.id },
														body: { role: "member" },
													})
												}
											>
												<ShieldAlert className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												title={t("settings.orgMembersSection.promoteToAdmin")}
												className={cn({ hidden: member.role !== "member" || isSelf })}
												disabled={updateRole.isPending}
												onClick={() =>
													updateRole.mutate({
														path: { memberId: member.id },
														body: { role: "admin" },
													})
												}
											>
												<Shield className="h-4 w-4" />
											</Button>

											<AlertDialog
												open={memberToRemove?.id === member.id}
												onOpenChange={(open) => !open && setMemberToRemove(null)}
											>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														title={t("settings.orgMembersSection.removeMember")}
														className={cn({ hidden: isOwner || isSelf })}
														onClick={() =>
															setMemberToRemove({
																id: member.id,
																name: member.user.name ?? member.user.email,
															})
														}
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															{t("settings.orgMembersSection.removeMember")}
														</AlertDialogTitle>
														<AlertDialogDescription>
															{t("settings.orgMembersSection.areYouSureYou")}{" "}
															<strong>{memberToRemove?.name}</strong>{" "}
															{t("settings.orgMembersSection.fromThisOrganizationThey")}
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
														<AlertDialogAction
															className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
															disabled={removeMember.isPending}
															onClick={() =>
																removeMember.mutate({
																	path: { memberId: memberToRemove!.id },
																})
															}
														>
															{t("settings.orgMembersSection.remove")}
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
