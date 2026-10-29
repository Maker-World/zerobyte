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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<FormValues>;
};

export const SMBForm = ({ form }: Props) => {
	const { t } = useTranslation();
	const guest = useWatch({ control: form.control, name: "guest" });

	return (
		<>
			<FormField
				control={form.control}
				name="server"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.info.server")}</FormLabel>
						<FormControl>
							<Input placeholder="192.168.1.100" value={field.value} onChange={field.onChange} />
						</FormControl>
						<FormDescription>{t("volumes.smbForm.smbServerIpAddress")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="share"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.info.share")}</FormLabel>
						<FormControl>
							<Input placeholder="myshare" value={field.value} onChange={field.onChange} />
						</FormControl>
						<FormDescription>{t("volumes.smbForm.smbShareNameOn")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="guest"
				defaultValue={false}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.smbForm.guestMode")}</FormLabel>
						<FormControl>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									aria-label={t("volumes.smbForm.connectAsGuest")}
									checked={field.value ?? false}
									onChange={(e) => {
										field.onChange(e.target.checked);
									}}
									className="rounded border-gray-300"
								/>
								<span className="text-sm">{t("volumes.smbForm.connectAsGuestNo")}</span>
							</div>
						</FormControl>
						<FormDescription>{t("volumes.smbForm.connectToTheSmb")}</FormDescription>
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
							<Input placeholder="admin" value={field.value} onChange={field.onChange} disabled={guest} />
						</FormControl>
						<FormDescription>{t("volumes.smbForm.usernameForSmbAuthentication")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="password"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("auth.password")}</FormLabel>
						<FormControl>
							<SecretInput
								placeholder="••••••••"
								value={field.value ?? ""}
								onChange={field.onChange}
								disabled={guest}
							/>
						</FormControl>
						<FormDescription>{t("volumes.smbForm.passwordForSmbAuthentication")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="vers"
				defaultValue="3.0"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.smbForm.smbVersion")}</FormLabel>
						<Select onValueChange={field.onChange} value={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t("volumes.smbForm.selectSmbVersion")} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="1.0">{t("volumes.smbForm.smbV10")}</SelectItem>
								<SelectItem value="2.0">{t("volumes.smbForm.smbV20")}</SelectItem>
								<SelectItem value="2.1">{t("volumes.smbForm.smbV21")}</SelectItem>
								<SelectItem value="3.0">{t("volumes.smbForm.smbV30")}</SelectItem>
							</SelectContent>
						</Select>
						<FormDescription>{t("volumes.smbForm.smbProtocolVersionTo")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="domain"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.smbForm.domainOptional")}</FormLabel>
						<FormControl>
							<Input
								placeholder={t("volumes.smbForm.workgroup")}
								value={field.value}
								onChange={field.onChange}
							/>
						</FormControl>
						<FormDescription>{t("volumes.smbForm.domainOrWorkgroupFor")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="port"
				defaultValue={445}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.nfsForm.port")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								placeholder="445"
								value={field.value}
								onChange={(e) => field.onChange(parseInt(e.target.value, 10) || undefined)}
							/>
						</FormControl>
						<FormDescription>{t("volumes.smbForm.smbServerPortDefault")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="mapToContainerUidGid"
				defaultValue={false}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.smbForm.ownershipMapping")}</FormLabel>
						<FormControl>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									aria-label={t("volumes.smbForm.mapAllFilesTo")}
									checked={field.value ?? false}
									onChange={(e) => field.onChange(e.target.checked)}
									className="rounded border-gray-300"
								/>
								<span className="text-sm">{t("volumes.smbForm.mapAllFilesTo")}</span>
							</div>
						</FormControl>
						<FormDescription>{t("volumes.smbForm.keepTheOldBehavior")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="readOnly"
				defaultValue={false}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.nfsForm.readOnlyMode")}</FormLabel>
						<FormControl>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									aria-label={t("volumes.nfsForm.mountSourceAsRead")}
									checked={field.value ?? false}
									onChange={(e) => field.onChange(e.target.checked)}
									className="rounded border-gray-300"
								/>
								<span className="text-sm">{t("volumes.nfsForm.mountSourceAsRead")}</span>
							</div>
						</FormControl>
						<FormDescription>{t("volumes.nfsForm.preventAnyModificationsTo")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
