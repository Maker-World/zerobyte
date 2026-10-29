import { useWatch, type UseFormReturn } from "react-hook-form";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Switch } from "../../../../components/ui/switch";
import type { RepositoryFormValues } from "../create-repository-form";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<RepositoryFormValues>;
};

export const SftpRepositoryForm = ({ form }: Props) => {
	const { t } = useTranslation();
	const skipHostKeyCheck = useWatch({ control: form.control, name: "skipHostKeyCheck" });

	return (
		<>
			<FormField
				control={form.control}
				name="host"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.info.host")}</FormLabel>
						<FormControl>
							<Input placeholder="192.168.1.100" {...field} />
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
								onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
							/>
						</FormControl>
						<FormDescription>{t("repositories.sftpRepositoryForm.sshPortDefault22")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="user"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("settings.userManagement.user")}</FormLabel>
						<FormControl>
							<Input placeholder="backup-user" {...field} />
						</FormControl>
						<FormDescription>
							{t("repositories.sftpRepositoryForm.sshUsernameForAuthentication")}
						</FormDescription>
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
							<Input placeholder="backups/zerobyte" {...field} />
						</FormControl>
						<FormDescription>{t("repositories.sftpRepositoryForm.repositoryPathOnThe")} </FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="privateKey"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.sftpRepositoryForm.sshPrivateKey")}</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								placeholder={t("repositories.sftpRepositoryForm.beginOpensshPrivateKey")}
							/>
						</FormControl>
						<FormDescription>{t("repositories.sftpRepositoryForm.pasteTheContentsOf")}</FormDescription>
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
							<Switch checked={field.value} onCheckedChange={field.onChange} />
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
		</>
	);
};
