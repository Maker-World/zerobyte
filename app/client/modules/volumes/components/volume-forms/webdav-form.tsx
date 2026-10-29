import type { UseFormReturn } from "react-hook-form";
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
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<FormValues>;
};

export const WebDAVForm = ({ form }: Props) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="server"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.info.server")}</FormLabel>
						<FormControl>
							<Input placeholder="example.com" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.webdavForm.webdavServerHostnameOr")}</FormDescription>
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
							<Input placeholder="/webdav" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.webdavForm.pathToTheWebdav")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="username"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.webdavForm.usernameOptional")}</FormLabel>
						<FormControl>
							<Input placeholder="admin" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.webdavForm.usernameForWebdavAuthentication")}</FormDescription>
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
						<FormDescription>{t("volumes.webdavForm.passwordForWebdavAuthentication")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="port"
				defaultValue={80}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.nfsForm.port")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								placeholder="80"
								{...field}
								onChange={(e) => field.onChange(parseInt(e.target.value, 10) || undefined)}
							/>
						</FormControl>
						<FormDescription>{t("volumes.webdavForm.webdavServerPortDefault")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="ssl"
				defaultValue={false}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.webdavForm.useSslHttps")}</FormLabel>
						<FormControl>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									aria-label={t("volumes.webdavForm.enableHttpsForSecure")}
									checked={field.value ?? false}
									onChange={(e) => field.onChange(e.target.checked)}
									className="rounded border-gray-300"
								/>
								<span className="text-sm">{t("volumes.webdavForm.enableHttpsForSecure")}</span>
							</div>
						</FormControl>
						<FormDescription>{t("volumes.webdavForm.useHttpsInsteadOf")}</FormDescription>
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
