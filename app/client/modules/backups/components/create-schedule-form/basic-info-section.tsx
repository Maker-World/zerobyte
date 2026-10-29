import { useQuery } from "@tanstack/react-query";
import { listRepositoriesOptions } from "~/client/api-client/@tanstack/react-query.gen";
import { RepositoryIcon } from "~/client/components/repository-icon";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import type { Volume } from "~/client/lib/types";
import type { UseFormReturn } from "react-hook-form";
import type { InternalFormValues } from "./types";
import { getBackupRepositoryCompatibility } from "@zerobyte/contracts/backup-context";
import { cn } from "~/client/lib/utils";
import { useTranslation } from "~/client/lib/i18n";

type BasicInfoSectionProps = {
	form: UseFormReturn<InternalFormValues>;
	volume: Volume;
};

export const BasicInfoSection = ({ form, volume }: BasicInfoSectionProps) => {
	const { t } = useTranslation();
	const { data: repositoriesData } = useQuery({
		...listRepositoriesOptions(),
	});

	return (
		<>
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem className="@medium:col-span-2">
						<FormLabel>{t("backups.basicInfoSection.backupName")}</FormLabel>
						<FormControl>
							<Input placeholder={t("backups.basicInfoSection.myBackup")} {...field} />
						</FormControl>
						<FormDescription>{t("backups.basicInfoSection.aUniqueNameTo")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="repositoryId"
				render={({ field }) => (
					<FormItem className="@medium:col-span-2">
						<FormLabel>{t("backups.basicInfoSection.backupRepository")}</FormLabel>
						<FormControl>
							<Select {...field} onValueChange={field.onChange} value={field.value ?? ""}>
								<SelectTrigger>
									<SelectValue placeholder={t("backups.basicInfoSection.selectARepository")} />
								</SelectTrigger>
								<SelectContent>
									{repositoriesData?.map((repo) => {
										const compatibility = getBackupRepositoryCompatibility(volume, repo.type);
										const disabled = !compatibility.compatible;

										return (
											<SelectItem key={repo.shortId} value={repo.shortId} disabled={disabled}>
												<span className="flex min-w-0 items-start gap-2 py-0.5">
													<RepositoryIcon backend={repo.type} />
													<span className="min-w-0">
														<span className="block truncate">{repo.name}</span>
														<span
															className={cn(
																"block text-xs text-muted-foreground text-pretty",
																{ hidden: !compatibility.reason },
															)}
														>
															{compatibility.reason}
														</span>
													</span>
												</span>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</FormControl>
						<FormDescription>
							{t("backups.basicInfoSection.chooseWhereEncryptedBackups")} <strong>{volume.name}</strong>{" "}
							{t("backups.basicInfoSection.willBeStored")}
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
