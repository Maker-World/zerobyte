import { useWatch, type UseFormReturn } from "react-hook-form";
import type { FormValues } from "../create-volume-form";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import { SecretInput } from "../../../../components/ui/secret-input";
import { Textarea } from "../../../../components/ui/textarea";
import { Switch } from "../../../../components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../components/ui/collapsible";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<FormValues>;
};

export const SFTPForm = ({ form }: Props) => {
	const { t } = useTranslation();
	const skipHostKeyCheck = useWatch({ control: form.control, name: "skipHostKeyCheck" });
	const unsafeSymlinkTargetsDisabled = Boolean(skipHostKeyCheck);

	return (
		<>
			<FormField
				control={form.control}
				name="host"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.info.host")}</FormLabel>
						<FormControl>
							<Input placeholder="example.com" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.sftpForm.sftpServerHostnameOr")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="port"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.nfsForm.port")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								placeholder="22"
								{...field}
								onChange={(e) => field.onChange(parseInt(e.target.value, 10) || undefined)}
							/>
						</FormControl>
						<FormDescription>{t("volumes.sftpForm.sftpServerPortDefault")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="username"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("auth.username")}</FormLabel>
						<FormControl>
							<Input placeholder="root" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.sftpForm.usernameForSftpAuthentication")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="password"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.sftpForm.passwordOptional")}</FormLabel>
						<FormControl>
							<SecretInput placeholder="••••••••" value={field.value ?? ""} onChange={field.onChange} />
						</FormControl>
						<FormDescription>{t("volumes.sftpForm.passwordForSftpAuthentication")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="privateKey"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.sftpForm.privateKeyOptional")}</FormLabel>
						<FormControl>
							<Textarea
								placeholder={t("volumes.sftpForm.beginOpensshPrivateKey")}
								className="font-mono text-xs"
								rows={5}
								{...field}
								value={field.value ?? ""}
							/>
						</FormControl>
						<FormDescription>{t("volumes.sftpForm.sshPrivateKeyFor")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="path"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.info.path")}</FormLabel>
						<FormControl>
							<Input placeholder="/backups" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.sftpForm.pathToTheDirectory")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="skipHostKeyCheck"
				render={({ field }) => (
					<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
						<div className="space-y-0.5">
							<FormLabel>{t("volumes.sftpForm.skipHostKeyVerification")}</FormLabel>
							<FormDescription>{t("volumes.sftpForm.disableSshHostKey")}</FormDescription>
						</div>
						<FormControl>
							<Switch
								checked={field.value}
								onCheckedChange={(checked) => {
									field.onChange(checked);
									if (checked) {
										form.setValue("allowUnsafeSymlinkTargets", false, {
											shouldDirty: true,
											shouldValidate: true,
										});
									}
								}}
							/>
						</FormControl>
					</FormItem>
				)}
			/>
			{!skipHostKeyCheck && (
				<FormField
					control={form.control}
					name="knownHosts"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("volumes.sftpForm.knownHosts")}</FormLabel>
							<FormControl>
								<Textarea
									placeholder={t("volumes.sftpForm.exampleComSshEd25519")}
									className="font-mono text-xs"
									rows={3}
									{...field}
									value={field.value ?? ""}
								/>
							</FormControl>
							<FormDescription>
								{t("volumes.sftpForm.theContentsOfThe")} <code>known_hosts</code>{" "}
								{t("volumes.sftpForm.fileForThisServer")}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}
			<Collapsible>
				<CollapsibleTrigger>{t("volumes.sftpForm.advancedSettings")}</CollapsibleTrigger>
				<CollapsibleContent className="pb-4 pt-4 space-y-4">
					<FormField
						control={form.control}
						name="allowLegacySshRsa"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
								<div className="space-y-0.5">
									<FormLabel>{t("volumes.sftpForm.allowLegacySshRsa")}</FormLabel>
									<FormDescription>
										{t("volumes.sftpForm.onlyEnableThisFor")} <code>ssh-rsa</code>{" "}
										{t("volumes.sftpForm.onlyItPermitsRsa")}
									</FormDescription>
								</div>
								<FormControl>
									<Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="allowUnsafeSymlinkTargets"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
								<div className="space-y-0.5">
									<FormLabel>{t("volumes.sftpForm.allowAbsoluteAndParent")}</FormLabel>
									<FormDescription>
										{t("volumes.sftpForm.onlyEnableThisFor2")} <code>..</code>{" "}
										{t("volumes.sftpForm.pathComponents")}
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value ?? false}
										onCheckedChange={field.onChange}
										disabled={unsafeSymlinkTargetsDisabled}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CollapsibleContent>
			</Collapsible>
		</>
	);
};
