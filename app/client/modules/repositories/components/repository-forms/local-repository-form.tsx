import type { UseFormReturn } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { FormItem, FormLabel, FormDescription, FormField, FormControl } from "../../../../components/ui/form";
import type { RepositoryFormValues } from "../create-repository-form";
import { useServerFn } from "@tanstack/react-start";
import { getServerConstants } from "~/server/lib/functions/server-constants";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderSelector } from "~/client/components/folder-selector";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<RepositoryFormValues>;
	exactPath: boolean;
};

export const LocalRepositoryForm = ({ form, exactPath }: Props) => {
	const { t } = useTranslation();
	const getConstants = useServerFn(getServerConstants);
	const { data: constants } = useSuspenseQuery({
		queryKey: ["server-constants"],
		queryFn: getConstants,
	});

	return (
		<FormField
			control={form.control}
			name="path"
			render={({ field }) => (
				<FormItem>
					<FormLabel>{t("repositories.localRepositoryForm.repositoryDirectory")}</FormLabel>
					<FormControl>
						<FolderSelector
							value={field.value || constants.REPOSITORY_BASE}
							onChange={field.onChange}
							displayValue={
								<>
									{field.value || constants.REPOSITORY_BASE}
									{!exactPath && <span className="text-muted-foreground">/{"{unique-id}"}</span>}
								</>
							}
							webBrowser={{
								mode: "dialog",
								title: t("repositories.localRepositoryForm.selectRepositoryDirectory"),
								description: t("repositories.localRepositoryForm.chooseADirectoryFrom"),
								warning: {
									title: (
										<>
											<AlertTriangle className="h-5 w-5 text-yellow-500" />
											{t("repositories.localRepositoryForm.importantHostMountRequired")}
										</>
									),
									description: (
										<>
											<div>{t("repositories.localRepositoryForm.whenSelectingACustom")}</div>
											<div className="font-medium">
												{t("repositories.localRepositoryForm.ifThePathIs")}
											</div>
											<div className="text-sm text-muted-foreground">
												{t("repositories.localRepositoryForm.theDefaultPath")}{" "}
												<code className="bg-muted px-1 rounded">
													{constants.REPOSITORY_BASE}
												</code>{" "}
												{t("repositories.localRepositoryForm.isSafeToUse")}
											</div>
										</>
									),
									continueLabel: "I Understand, Continue",
								},
							}}
						/>
					</FormControl>
					<FormDescription>
						{exactPath
							? t("repositories.localRepositoryForm.theExactPathTo")
							: t("repositories.localRepositoryForm.aUniqueSubdirectoryWill")}
					</FormDescription>
				</FormItem>
			)}
		/>
	);
};
