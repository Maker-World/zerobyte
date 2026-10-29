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
import { SecretInput } from "../../../../components/ui/secret-input";
import type { RepositoryFormValues } from "../create-repository-form";
import { useTranslation } from "~/client/lib/i18n";

type Props = {
	form: UseFormReturn<RepositoryFormValues>;
};

export const S3RepositoryForm = ({ form }: Props) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="endpoint"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.r2RepositoryForm.endpoint")}</FormLabel>
						<FormControl>
							<Input placeholder="s3.amazonaws.com" {...field} />
						</FormControl>
						<FormDescription>{t("repositories.s3RepositoryForm.s3CompatibleEndpointUrl")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="bucket"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.gcsRepositoryForm.bucket")}</FormLabel>
						<FormControl>
							<Input placeholder="my-backup-bucket" {...field} />
						</FormControl>
						<FormDescription>{t("repositories.s3RepositoryForm.s3BucketNameFor")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="accessKeyId"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.r2RepositoryForm.accessKeyId")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.s3RepositoryForm.akiaiosfodnn7example")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.s3RepositoryForm.s3AccessKeyId")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="secretAccessKey"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.r2RepositoryForm.secretAccessKey")}</FormLabel>
						<FormControl>
							<SecretInput placeholder="••••••••" value={field.value ?? ""} onChange={field.onChange} />
						</FormControl>
						<FormDescription>{t("repositories.s3RepositoryForm.s3SecretAccessKey")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
