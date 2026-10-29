import type { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert";
import { listRcloneRemotesOptions } from "../../../../api-client/@tanstack/react-query.gen";
import type { RepositoryFormValues } from "../create-repository-form";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<RepositoryFormValues>;
};

export const RcloneRepositoryForm = ({ form }: Props) => {
	const { t } = useTranslation();
	const { data: rcloneRemotes, isLoading: isLoadingRemotes } = useQuery(listRcloneRemotesOptions());

	if (!isLoadingRemotes && (!rcloneRemotes || rcloneRemotes.length === 0)) {
		return (
			<Alert>
				<AlertTitle>{t("volumes.rcloneForm.noRcloneRemotesConfigured")}</AlertTitle>
				<AlertDescription className="space-y-2">
					<p>{t("volumes.rcloneForm.toUseRcloneYou")}</p>
					<a
						href="https://rclone.org/docs/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-foreground underline underline-offset-4 inline-flex items-center gap-1"
					>
						{t("volumes.rcloneForm.viewRcloneDocumentation")}
						<ExternalLink className="w-3 h-3" />
					</a>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<>
			<FormField
				control={form.control}
				name="remote"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("settings.machineRow.remote")}</FormLabel>
						<Select onValueChange={(v) => field.onChange(v)} value={field.value ?? ""}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t("volumes.rcloneForm.selectAnRcloneRemote")} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{isLoadingRemotes ? (
									<SelectItem value="loading" disabled>
										{t("volumes.rcloneForm.loadingRemotes")}
									</SelectItem>
								) : (
									rcloneRemotes?.map((remote: { name: string; type: string }) => (
										<SelectItem key={remote.name} value={remote.name}>
											{remote.name} ({remote.type})
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
						<FormDescription>{t("volumes.rcloneForm.selectTheRcloneRemote")}</FormDescription>
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
						<FormDescription>{t("repositories.rcloneRepositoryForm.pathWithinTheRemote")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
