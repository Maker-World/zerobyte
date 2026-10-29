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

export const AzureRepositoryForm = ({ form }: Props) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="container"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.azureRepositoryForm.container")}</FormLabel>
						<FormControl>
							<Input placeholder="my-backup-container" {...field} />
						</FormControl>
						<FormDescription>
							{t("repositories.azureRepositoryForm.azureBlobStorageContainer")}
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="accountName"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.azureRepositoryForm.accountName")}</FormLabel>
						<FormControl>
							<Input placeholder="mystorageaccount" {...field} />
						</FormControl>
						<FormDescription>
							{t("repositories.azureRepositoryForm.azureStorageAccountName")}
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="accountKey"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.azureRepositoryForm.accountKey")}</FormLabel>
						<FormControl>
							<SecretInput placeholder="••••••••" value={field.value ?? ""} onChange={field.onChange} />
						</FormControl>
						<FormDescription>
							{t("repositories.azureRepositoryForm.azureStorageAccountKey")}
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="endpointSuffix"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.azureRepositoryForm.endpointSuffixOptional")}</FormLabel>
						<FormControl>
							<Input placeholder="core.windows.net" {...field} />
						</FormControl>
						<FormDescription>
							{t("repositories.azureRepositoryForm.customAzureEndpointSuffix")}
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
