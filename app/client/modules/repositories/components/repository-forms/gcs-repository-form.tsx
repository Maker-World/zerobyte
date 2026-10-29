import type { UseFormReturn } from "react-hook-form";
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
import type { RepositoryFormValues } from "../create-repository-form";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<RepositoryFormValues>;
};

export const GCSRepositoryForm = ({ form }: Props) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="bucket"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.gcsRepositoryForm.bucket")}</FormLabel>
						<FormControl>
							<Input placeholder="my-backup-bucket" {...field} />
						</FormControl>
						<FormDescription>{t("repositories.gcsRepositoryForm.gcsBucketNameFor")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="projectId"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.gcsRepositoryForm.projectId")}</FormLabel>
						<FormControl>
							<Input placeholder="my-gcp-project-123" {...field} />
						</FormControl>
						<FormDescription>{t("repositories.gcsRepositoryForm.googleCloudProjectId")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="credentialsJson"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.gcsRepositoryForm.serviceAccountJson")}</FormLabel>
						<FormControl>
							<Textarea
								placeholder={t("repositories.gcsRepositoryForm.pasteServiceAccountJson")}
								{...field}
							/>
						</FormControl>
						<FormDescription>
							{t("repositories.gcsRepositoryForm.serviceAccountJsonCredentials")}
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
