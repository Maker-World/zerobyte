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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<FormValues>;
};

export const NFSForm = ({ form }: Props) => {
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
							<Input placeholder="192.168.1.100" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.nfsForm.nfsServerIpAddress")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="exportPath"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.info.exportPath")}</FormLabel>
						<FormControl>
							<Input placeholder="/export/data" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.nfsForm.pathToTheNfs")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="port"
				defaultValue={2049}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.nfsForm.port")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								placeholder="2049"
								{...field}
								onChange={(e) => field.onChange(parseInt(e.target.value, 10) || undefined)}
							/>
						</FormControl>
						<FormDescription>{t("volumes.nfsForm.nfsServerPortDefault")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="version"
				defaultValue="4.1"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.nfsForm.version")}</FormLabel>
						<Select onValueChange={field.onChange} value={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t("volumes.nfsForm.selectNfsVersion")} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="3">{t("volumes.nfsForm.nfsV3")}</SelectItem>
								<SelectItem value="4">{t("volumes.nfsForm.nfsV4")}</SelectItem>
								<SelectItem value="4.1">{t("volumes.nfsForm.nfsV41")}</SelectItem>
							</SelectContent>
						</Select>
						<FormDescription>{t("volumes.nfsForm.nfsProtocolVersionTo")}</FormDescription>
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
