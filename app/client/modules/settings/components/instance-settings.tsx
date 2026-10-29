import { parseError } from "~/client/lib/errors";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Users, Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	getPasswordLoginStatusOptions,
	getRegistrationStatusOptions,
	setPasswordLoginStatusMutation,
	setRegistrationStatusMutation,
} from "~/client/api-client/@tanstack/react-query.gen";
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
import { Card, CardContent, CardDescription, CardTitle } from "~/client/components/ui/card";
import { Label } from "~/client/components/ui/label";
import { Switch } from "~/client/components/ui/switch";
import { usePermissions } from "~/client/hooks/use-permissions";
import type { AppContext } from "~/context";
import { UserManagement } from "./user-management";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	appContext: AppContext;
};

export function InstanceSettings({ appContext }: Props) {
	const permissions = usePermissions();
	const showUserManagement = permissions.can("instanceUsers.manage");
	const showRegistrationSettings = permissions.can("registration.manage");
	const showPasswordLoginSettings = permissions.can("passwordLogin.manage");
	const showSystemSettings = showRegistrationSettings || showPasswordLoginSettings;

	return (
		<div className="space-y-6">
			{showUserManagement && <UserManagementSection currentUser={appContext.user} />}
			{showSystemSettings && (
				<SystemSettingsSection
					showPasswordLoginSettings={showPasswordLoginSettings}
					showRegistrationSettings={showRegistrationSettings}
				/>
			)}
		</div>
	);
}

function UserManagementSection({ currentUser }: { currentUser: { id: string } | undefined | null }) {
	const { t } = useTranslation();
	return (
		<Card className="p-0 gap-0">
			<div className="border-b border-border/50 bg-card-header p-6">
				<CardTitle className="flex items-center gap-2">
					<Users className="size-5" />
					{t("settings.instanceSettings.userManagement")}
				</CardTitle>
				<CardDescription className="mt-1.5">
					{t("settings.instanceSettings.manageUsersRolesAnd")}
				</CardDescription>
			</div>
			<UserManagement currentUser={currentUser} />
		</Card>
	);
}

type SystemSettingsSectionProps = {
	showPasswordLoginSettings: boolean;
	showRegistrationSettings: boolean;
};

function SystemSettingsSection({ showPasswordLoginSettings, showRegistrationSettings }: SystemSettingsSectionProps) {
	const { t } = useTranslation();
	return (
		<Card className="p-0 gap-0">
			<div className="border-b border-border/50 bg-card-header p-6">
				<CardTitle className="flex items-center gap-2">
					<SettingsIcon className="size-5" />
					{t("settings.instanceSettings.systemSettings")}
				</CardTitle>
				<CardDescription className="mt-1.5">
					{t("settings.instanceSettings.manageSystemWideSettings")}
				</CardDescription>
			</div>
			<CardContent className="p-6 space-y-6">
				{showRegistrationSettings && <RegistrationSettingsSection />}
				{showPasswordLoginSettings && <PasswordLoginSettingsSection showDivider={showRegistrationSettings} />}
			</CardContent>
		</Card>
	);
}

function RegistrationSettingsSection() {
	const { t } = useTranslation();
	const registrationStatus = useSuspenseQuery({
		...getRegistrationStatusOptions(),
	});

	const updateRegistrationStatusMutation = useMutation({
		...setRegistrationStatusMutation(),
		onSuccess: () => {
			toast.success(t("settings.instanceSettings.registrationSettingsUpdated"));
		},
		onError: (error) => {
			toast.error(t("settings.instanceSettings.failedToUpdateRegistration"), {
				description: parseError(error)?.message,
			});
		},
	});

	return (
		<div className="flex items-center justify-between">
			<div className="space-y-0.5">
				<Label htmlFor="enable-registrations" className="text-base">
					{t("settings.instanceSettings.enableNewUserRegistrations")}
				</Label>
				<p className="text-sm text-muted-foreground max-w-2xl">
					{t("settings.instanceSettings.whenEnabledNewUsers")}
				</p>
			</div>
			<Switch
				id="enable-registrations"
				checked={registrationStatus.data.enabled}
				onCheckedChange={(checked) => updateRegistrationStatusMutation.mutate({ body: { enabled: checked } })}
				disabled={updateRegistrationStatusMutation.isPending}
			/>
		</div>
	);
}

function PasswordLoginSettingsSection({ showDivider }: { showDivider: boolean }) {
	const { t } = useTranslation();
	const [showDisablePasswordLoginConfirm, setShowDisablePasswordLoginConfirm] = useState(false);

	let passwordLoginSectionClassName = "flex items-center justify-between";
	if (showDivider) {
		passwordLoginSectionClassName += " pt-4 border-t border-border/50";
	}

	const passwordLoginStatus = useSuspenseQuery({
		...getPasswordLoginStatusOptions(),
	});

	const updatePasswordLoginStatusMutation = useMutation({
		...setPasswordLoginStatusMutation(),
		onSuccess: () => {
			toast.success(t("settings.instanceSettings.loginSettingsUpdated"));
		},
		onError: (error) => {
			toast.error(t("settings.instanceSettings.failedToUpdateLogin"), {
				description: parseError(error)?.message,
			});
		},
	});

	const updatePasswordLoginDisabled = (disabled: boolean) => {
		updatePasswordLoginStatusMutation.mutate({ body: { disabled } });
	};

	return (
		<>
			<div className={passwordLoginSectionClassName}>
				<div className="space-y-0.5">
					<Label htmlFor="enable-password-login" className="text-base">
						{t("settings.instanceSettings.enablePasswordLogin")}
					</Label>
					<p className="text-sm text-muted-foreground max-w-2xl">
						{t("settings.instanceSettings.whenDisabledTheUsername")}
					</p>
				</div>
				<Switch
					id="enable-password-login"
					checked={!passwordLoginStatus.data.disabled}
					onCheckedChange={(checked) => {
						if (checked) {
							updatePasswordLoginDisabled(false);
							return;
						}

						setShowDisablePasswordLoginConfirm(true);
					}}
					disabled={updatePasswordLoginStatusMutation.isPending}
				/>
			</div>
			<AlertDialog open={showDisablePasswordLoginConfirm} onOpenChange={setShowDisablePasswordLoginConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("settings.instanceSettings.disablePasswordLogin")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("settings.instanceSettings.ifYouDoNot")}
							<code>docker exec -it zerobyte bun run cli enable-password-login</code>{" "}
							{t("settings.instanceSettings.onTheServer")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								updatePasswordLoginDisabled(true);
							}}
						>
							{t("settings.instanceSettings.disablePasswordLogin2")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
