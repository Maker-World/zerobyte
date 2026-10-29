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

export const RestRepositoryForm = ({ form }: Props) => {
	const { t } = useTranslation();
	return (
		<>
			<FormField
				control={form.control}
				name="url"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.restRepositoryForm.restServerUrl")}</FormLabel>
						<FormControl>
							<Input placeholder="http://192.168.1.30:8000" {...field} />
						</FormControl>
						<FormDescription>{t("repositories.restRepositoryForm.urlOfTheRest")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="path"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.restRepositoryForm.repositoryPathOptional")}</FormLabel>
						<FormControl>
							<Input placeholder="my-backup-repo" {...field} />
						</FormControl>
						<FormDescription>{t("repositories.restRepositoryForm.pathToTheRepository")}</FormDescription>
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
							<Input placeholder="username" {...field} />
						</FormControl>
						<FormDescription>{t("repositories.restRepositoryForm.usernameForRestServer")}</FormDescription>
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
						<FormDescription>{t("repositories.restRepositoryForm.passwordForRestServer")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
