import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import {
	deleteNotificationDestinationMutation,
	getNotificationDestinationOptions,
	testNotificationDestinationMutation,
} from "~/client/api-client/@tanstack/react-query.gen";
import { Button } from "~/client/components/ui/button";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/client/components/ui/dropdown-menu";
import { Badge } from "~/client/components/ui/badge";
import { Card, CardTitle } from "~/client/components/ui/card";
import { Separator } from "~/client/components/ui/separator";
import { parseError } from "~/client/lib/errors";
import { cn } from "~/client/lib/utils";
import {
	Bell,
	Bot,
	ChevronDown,
	Globe,
	Hash,
	Key,
	Link,
	Lock,
	Mail,
	AtSign,
	AlertCircle,
	Clock,
	MessageSquare,
	Pencil,
	Server,
	Settings,
	Shield,
	Smile,
	TestTube2,
	Trash2,
	Users,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { GetNotificationDestinationResponse } from "~/client/api-client/types.gen";
import { useTimeFormat } from "~/client/lib/datetime";
import { useTranslation } from "~/client/lib/i18n";

type NotificationConfig = GetNotificationDestinationResponse["config"];
type NotificationStatus = GetNotificationDestinationResponse["status"];
type Props = {
	icon: React.ReactNode;
	label: string;
	value: string;
	mono?: boolean;
};

function ConfigRow({ icon, label, value, mono }: Props) {
	return (
		<div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
			<span className="text-muted-foreground shrink-0">{icon}</span>
			<span className="text-sm text-muted-foreground w-40 shrink-0">{label}</span>
			<span className={cn("text-sm break-all", { "font-mono bg-muted/50 px-2 py-0.5 rounded": mono })}>
				{value}
			</span>
		</div>
	);
}

function getStatusLabel(enabled: boolean, status: NotificationStatus) {
	return enabled ? status : "disabled";
}

function getStatusClass(enabled: boolean, status: NotificationStatus) {
	if (!enabled) return "bg-gray-500";
	if (status === "healthy") return "bg-success";
	if (status === "error") return "bg-red-500";
	return "bg-yellow-500";
}

function NotificationConfigRows({ config }: { config: NotificationConfig }) {
	const { t } = useTranslation();
	switch (config.type) {
		case "slack":
			return (
				<>
					<ConfigRow
						icon={<Globe className="h-4 w-4" />}
						label={t("notifications.discordForm.webhookUrl")}
						value={config.webhookUrl}
						mono
					/>
					<ConfigRow
						icon={<Bot className="h-4 w-4" />}
						label={t("notifications.notificationDetails.botUsername")}
						value={config.username || "—"}
					/>
					<ConfigRow
						icon={<Smile className="h-4 w-4" />}
						label={t("notifications.notificationDetails.iconEmoji")}
						value={config.iconEmoji || "—"}
					/>
				</>
			);
		case "discord":
			return (
				<>
					<ConfigRow
						icon={<Globe className="h-4 w-4" />}
						label={t("notifications.discordForm.webhookUrl")}
						value={config.webhookUrl}
						mono
					/>
					<ConfigRow
						icon={<Bot className="h-4 w-4" />}
						label={t("auth.username")}
						value={config.username || "—"}
					/>
					<ConfigRow
						icon={<Link className="h-4 w-4" />}
						label={t("notifications.notificationDetails.avatarUrl")}
						value={config.avatarUrl || "—"}
						mono
					/>
					<ConfigRow
						icon={<MessageSquare className="h-4 w-4" />}
						label={t("notifications.notificationDetails.threadId")}
						value={config.threadId || "—"}
					/>
				</>
			);
		case "email":
			return (
				<>
					<ConfigRow
						icon={<Server className="h-4 w-4" />}
						label={t("notifications.emailForm.smtpHost")}
						value={config.smtpHost}
						mono
					/>
					<ConfigRow
						icon={<Server className="h-4 w-4" />}
						label={t("notifications.emailForm.smtpPort")}
						value={String(config.smtpPort)}
					/>
					<ConfigRow
						icon={<AtSign className="h-4 w-4" />}
						label={t("auth.username")}
						value={config.username || "—"}
					/>
					<ConfigRow
						icon={<Lock className="h-4 w-4" />}
						label={t("auth.password")}
						value={config.password || "—"}
					/>
					<ConfigRow
						icon={<Mail className="h-4 w-4" />}
						label={t("notifications.notificationDetails.from")}
						value={config.from}
					/>
					{config.fromName && (
						<ConfigRow
							icon={<Mail className="h-4 w-4" />}
							label={t("notifications.notificationDetails.fromName")}
							value={config.fromName}
						/>
					)}
					<ConfigRow
						icon={<Users className="h-4 w-4" />}
						label={t("notifications.notificationDetails.to")}
						value={config.to.join(", ")}
					/>
					<ConfigRow
						icon={<Shield className="h-4 w-4" />}
						label="TLS"
						value={config.useTLS ? "Enabled" : "Disabled"}
					/>
				</>
			);
		case "gotify":
			return (
				<>
					<ConfigRow
						icon={<Globe className="h-4 w-4" />}
						label={t("notifications.gotifyForm.serverUrl")}
						value={config.serverUrl}
						mono
					/>
					<ConfigRow
						icon={<Key className="h-4 w-4" />}
						label={t("notifications.notificationDetails.token")}
						value={config.token}
						mono
					/>
					<ConfigRow
						icon={<Globe className="h-4 w-4" />}
						label={t("volumes.info.path")}
						value={config.path || "—"}
						mono
					/>
					<ConfigRow
						icon={<Settings className="h-4 w-4" />}
						label={t("notifications.gotifyForm.priority")}
						value={String(config.priority)}
					/>
				</>
			);
		case "ntfy":
			return (
				<>
					<ConfigRow
						icon={<Globe className="h-4 w-4" />}
						label={t("notifications.gotifyForm.serverUrl")}
						value={config.serverUrl || "Default (ntfy.sh)"}
						mono
					/>
					<ConfigRow
						icon={<Hash className="h-4 w-4" />}
						label={t("notifications.ntfyForm.topic")}
						value={config.topic}
					/>
					<ConfigRow
						icon={<Settings className="h-4 w-4" />}
						label={t("notifications.gotifyForm.priority")}
						value={config.priority}
					/>
					<ConfigRow
						icon={<AtSign className="h-4 w-4" />}
						label={t("auth.username")}
						value={config.username || "—"}
					/>
					<ConfigRow
						icon={<Lock className="h-4 w-4" />}
						label={t("auth.password")}
						value={config.password || "—"}
					/>
					<ConfigRow
						icon={<Key className="h-4 w-4" />}
						label={t("notifications.notificationDetails.accessToken")}
						value={config.accessToken || "—"}
					/>
				</>
			);
		case "pushover":
			return (
				<>
					<ConfigRow
						icon={<Key className="h-4 w-4" />}
						label={t("notifications.pushoverForm.userKey")}
						value={config.userKey}
						mono
					/>
					<ConfigRow
						icon={<Key className="h-4 w-4" />}
						label={t("notifications.pushoverForm.apiToken")}
						value={config.apiToken}
						mono
					/>
					<ConfigRow
						icon={<Settings className="h-4 w-4" />}
						label={t("notifications.notificationDetails.devices")}
						value={config.devices || "—"}
					/>
					<ConfigRow
						icon={<Settings className="h-4 w-4" />}
						label={t("notifications.gotifyForm.priority")}
						value={String(config.priority)}
					/>
				</>
			);
		case "telegram":
			return (
				<>
					<ConfigRow
						icon={<Key className="h-4 w-4" />}
						label={t("notifications.telegramForm.botToken")}
						value={config.botToken}
						mono
					/>
					<ConfigRow
						icon={<Hash className="h-4 w-4" />}
						label={t("notifications.telegramForm.chatId")}
						value={config.chatId}
						mono
					/>
					<ConfigRow
						icon={<MessageSquare className="h-4 w-4" />}
						label={t("notifications.notificationDetails.threadId")}
						value={config.threadId || "—"}
					/>
				</>
			);
		case "generic":
			return (
				<>
					<ConfigRow icon={<Globe className="h-4 w-4" />} label="URL" value={config.url} mono />
					<ConfigRow
						icon={<Settings className="h-4 w-4" />}
						label={t("notifications.genericForm.method")}
						value={config.method}
					/>
					<ConfigRow
						icon={<Settings className="h-4 w-4" />}
						label={t("notifications.genericForm.contentType")}
						value={config.contentType || "—"}
					/>
					<ConfigRow
						icon={<Settings className="h-4 w-4" />}
						label={t("notifications.notificationDetails.jsonMode")}
						value={config.useJson ? "Enabled" : "Disabled"}
					/>
					<ConfigRow
						icon={<Key className="h-4 w-4" />}
						label={t("notifications.genericForm.titleKey")}
						value={config.titleKey || "—"}
						mono
					/>
					<ConfigRow
						icon={<Key className="h-4 w-4" />}
						label={t("notifications.genericForm.messageKey")}
						value={config.messageKey || "—"}
						mono
					/>
					{config.headers?.map((h, i) => (
						<ConfigRow
							key={i}
							icon={<Link className="h-4 w-4" />}
							label={`Header ${i + 1}`}
							value={h}
							mono
						/>
					))}
				</>
			);
		case "custom":
			return (
				<ConfigRow
					icon={<Globe className="h-4 w-4" />}
					label={t("notifications.customForm.shoutrrrUrl")}
					value={config.shoutrrrUrl}
					mono
				/>
			);
	}
}

export function NotificationDetailsPage({ notificationId }: { notificationId: string }) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const { formatDateTime } = useTimeFormat();

	const { data } = useSuspenseQuery({
		...getNotificationDestinationOptions({ path: { id: notificationId } }),
	});

	const deleteDestination = useMutation({
		...deleteNotificationDestinationMutation(),
		onSuccess: () => {
			toast.success(t("notifications.notificationDetails.notificationDestinationDeletedSuccessfully"));
			void navigate({ to: "/notifications" });
		},
		onError: (error) => {
			toast.error(t("notifications.notificationDetails.failedToDeleteNotification"), {
				description: parseError(error)?.message,
			});
		},
	});

	const testDestination = useMutation({
		...testNotificationDestinationMutation(),
		onSuccess: () => {
			toast.success(t("notifications.notificationDetails.testNotificationSentSuccessfully"));
		},
		onError: (error) => {
			toast.error(t("notifications.notificationDetails.failedToSendTest"), {
				description: parseError(error)?.message,
			});
		},
	});

	const handleConfirmDelete = () => {
		setShowDeleteConfirm(false);
		deleteDestination.mutate({ path: { id: String(data.id) } });
	};

	const handleTest = () => {
		testDestination.mutate({ path: { id: String(data.id) } });
	};

	return (
		<>
			<div className="flex flex-col gap-6 @container">
				<Card className="px-6 py-5">
					<div className="flex flex-col @wide:flex-row @wide:items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="hidden @medium:flex items-center justify-center w-10 h-10 shrink-0 rounded-lg bg-muted/50 border border-border/50">
								<Bell className="h-5 w-5 text-muted-foreground" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h2 className="text-lg font-semibold tracking-tight">{data.name}</h2>
									<Separator orientation="vertical" className="h-4 mx-1" />
									<Badge variant="outline" className="capitalize gap-1.5">
										<span
											className={cn(
												"w-2 h-2 rounded-full shrink-0",
												getStatusClass(data.enabled, data.status),
											)}
										/>
										{getStatusLabel(data.enabled, data.status)}
									</Badge>
									<Badge variant="secondary" className="capitalize">
										{data.type}
									</Badge>
								</div>
								<p className="text-sm text-muted-foreground mt-0.5">
									{t("volumes.volumeDetails.created", { dateTime: formatDateTime(data.createdAt) })}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button
								onClick={handleTest}
								disabled={testDestination.isPending || !data.enabled}
								variant="outline"
								loading={testDestination.isPending}
							>
								<TestTube2 className="h-4 w-4 mr-2" />
								{t("notifications.notificationDetails.test")}
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline">
										{t("common.actions")}
										<ChevronDown className="h-4 w-4 ml-1" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={() => navigate({ to: `/notifications/${data.id}/edit` })}
									>
										<Pencil />
										{t("common.edit")}
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										variant="destructive"
										onClick={() => setShowDeleteConfirm(true)}
										disabled={deleteDestination.isPending}
									>
										<Trash2 />
										{t("settings.passkeysSection.delete")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</Card>

				<Card className="px-6 py-6">
					<CardTitle className="flex items-center gap-2 mb-5">
						<Settings className="h-4 w-4 text-muted-foreground" />
						{t("volumes.volumeDetails.configuration")}
					</CardTitle>
					<div className="space-y-0 divide-y divide-border/50">
						<NotificationConfigRows config={data.config} />
					</div>
				</Card>

				<Card className="px-6 py-6">
					<CardTitle className="flex items-center gap-2 mb-5">
						<Clock className="h-4 w-4 text-muted-foreground" />
						{t("notifications.notificationDetails.deliveryHealth")}
					</CardTitle>
					<div className="space-y-0 divide-y divide-border/50">
						<ConfigRow
							icon={<Bell className="h-4 w-4" />}
							label={t("common.status")}
							value={getStatusLabel(data.enabled, data.status)}
						/>
						<ConfigRow
							icon={<Settings className="h-4 w-4" />}
							label={t("settings.twoFactorSection.enabled")}
							value={data.enabled ? "Yes" : "No"}
						/>
						<ConfigRow
							icon={<Clock className="h-4 w-4" />}
							label={t("repositories.info.lastChecked")}
							value={data.lastChecked ? formatDateTime(data.lastChecked) : "Never"}
						/>
					</div>
				</Card>

				<Card className={cn("px-6 py-6", { hidden: !data.lastError })}>
					<CardTitle className="flex items-center gap-2 mb-3 text-red-600">
						<AlertCircle className="h-4 w-4" />
						{t("notifications.notificationDetails.lastDeliveryError")}
					</CardTitle>
					<p className="text-sm text-muted-foreground wrap-break-word">{data.lastError}</p>
				</Card>
			</div>

			<AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("notifications.notificationDetails.deleteNotificationDestination")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("notifications.notificationDetails.areYouSureYou", { name: data.name })}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmDelete}>
							<Trash2 className="h-4 w-4 mr-2" />
							{t("settings.passkeysSection.delete")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
