import { parseError } from "~/client/lib/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Loader2, Plug, Save, XCircle } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { cn } from "~/client/lib/utils";
import { Button } from "../../../components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import {
	directoryConfigSchema,
	nfsConfigSchema,
	rcloneConfigSchema,
	sftpConfigSchema,
	smbConfigSchema,
	volumeConfigSchema,
	webdavConfigSchema,
	type BackendType,
} from "@zerobyte/contracts/volumes";
import { testConnectionMutation } from "../../../api-client/@tanstack/react-query.gen";
import { useSystemInfo } from "~/client/hooks/use-system-info";
import { useScrollToFormError } from "~/client/hooks/use-scroll-to-form-error";
import { DirectoryForm, NFSForm, SMBForm, WebDAVForm, RcloneForm, SFTPForm } from "./volume-forms";
import { useTranslation } from "~/client/lib/i18n";

export const formSchema = z
	.discriminatedUnion("backend", [
		directoryConfigSchema.extend({ name: z.string().min(2).max(32) }),
		nfsConfigSchema.extend({ name: z.string().min(2).max(32) }),
		smbConfigSchema.extend({ name: z.string().min(2).max(32) }),
		webdavConfigSchema.extend({ name: z.string().min(2).max(32) }),
		rcloneConfigSchema.extend({ name: z.string().min(2).max(32) }),
		sftpConfigSchema.extend({ name: z.string().min(2).max(32) }),
	])
	.superRefine((value, ctx) => {
		if (value.backend === "sftp" && !value.skipHostKeyCheck && !value.knownHosts?.trim()) {
			ctx.addIssue({
				code: "custom",
				message: "Known hosts are required unless host key verification is skipped",
				path: ["knownHosts"],
			});
		}
		if (
			value.backend === "sftp" &&
			value.allowUnsafeSymlinkTargets &&
			(value.skipHostKeyCheck || !value.knownHosts?.trim())
		) {
			ctx.addIssue({
				code: "custom",
				message: "Unsafe symlink targets require host key verification with known hosts",
				path: ["allowUnsafeSymlinkTargets"],
			});
		}
	});

export type FormValues = z.input<typeof formSchema>;

type Props = {
	onSubmit: (values: FormValues) => void;
	mode?: "create" | "update";
	initialValues?: Partial<FormValues>;
	formId?: string;
	loading?: boolean;
	className?: string;
	readOnly?: boolean;
};

const backendOptions: { value: BackendType; label: string }[] = [
	{ value: "directory", label: "Directory" },
	{ value: "nfs", label: "NFS" },
	{ value: "smb", label: "SMB" },
	{ value: "webdav", label: "WebDAV" },
	{ value: "sftp", label: "SFTP" },
	{ value: "rclone", label: "rclone" },
];

const defaultValuesForType = {
	directory: { backend: "directory" as const, path: "/" },
	nfs: { backend: "nfs" as const, port: 2049, version: "4.1" as const },
	smb: { backend: "smb" as const, port: 445, vers: "3.0" as const, mapToContainerUidGid: false },
	webdav: { backend: "webdav" as const, port: 80, ssl: false, path: "/webdav" },
	rclone: { backend: "rclone" as const, path: "/" },
	sftp: {
		backend: "sftp" as const,
		port: 22,
		path: "/",
		skipHostKeyCheck: false,
		allowLegacySshRsa: false,
		allowUnsafeSymlinkTargets: false,
	},
};

export const CreateVolumeForm = ({ onSubmit, mode = "create", initialValues, formId, loading, className }: Props) => {
	const { t } = useTranslation();
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema, undefined, { raw: true }),
		defaultValues: initialValues || {
			name: "",
			backend: "directory",
		},
		resetOptions: {
			keepDefaultValues: true,
			keepDirtyValues: false,
		},
	});

	const { getValues } = form;

	const { capabilities, runtime } = useSystemInfo();
	const isBackendAllowed = (backend: BackendType) => capabilities.volumeBackends.includes(backend);
	const scrollToFirstError = useScrollToFormError();
	const watchedBackend = useWatch({ control: form.control, name: "backend" });

	const [testMessage, setTestMessage] = useState<{ success: boolean; message: string } | null>(null);

	const testBackendConnection = useMutation({
		...testConnectionMutation(),
		onMutate: () => {
			setTestMessage(null);
		},
		onError: (error) => {
			setTestMessage({
				success: false,
				message: parseError(error)?.message || "Failed to test connection. Please try again.",
			});
		},
		onSuccess: (data) => {
			setTestMessage(data);
		},
	});

	const handleTestConnection = async () => {
		const formValues = getValues();
		const { name: _, ...configCandidate } = formValues;
		const parsedConfig = volumeConfigSchema.safeParse(configCandidate);

		if (!parsedConfig.success) {
			setTestMessage({ success: false, message: t("volumes.createVolumeForm.pleaseFixValidationErrors") });
			return;
		}

		if (
			parsedConfig.data.backend === "nfs" ||
			parsedConfig.data.backend === "smb" ||
			parsedConfig.data.backend === "webdav" ||
			parsedConfig.data.backend === "sftp"
		) {
			testBackendConnection.mutate({
				body: { config: parsedConfig.data },
			});
		}
	};

	return (
		<Form {...form}>
			<form
				id={formId}
				onSubmit={form.handleSubmit(onSubmit, scrollToFirstError)}
				className={cn("space-y-4", className)}
			>
				<fieldset className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("common.name")}</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder={t("volumes.agentFilesystemSourceForm.sourceName")}
										maxLength={32}
										minLength={2}
									/>
								</FormControl>
								<FormDescription>{t("volumes.createVolumeForm.aUniqueNameFor")}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					{(runtime === "server" || capabilities.volumeBackends.length > 1) && (
						<FormField
							control={form.control}
							name="backend"
							defaultValue="directory"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("common.backend")}</FormLabel>
									<Select
										onValueChange={(value) => {
											field.onChange(value);
											if (mode === "create") {
												form.reset({
													name: form.getValues().name,
													...defaultValuesForType[value as keyof typeof defaultValuesForType],
												});
											}
										}}
										value={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={t("volumes.createVolumeForm.selectABackend")}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{backendOptions.map(({ value, label }) => (
												<SelectItem
													key={value}
													value={value}
													disabled={!isBackendAllowed(value)}
												>
													{value === "directory" ? t("volumes.directory") : label}
													{!isBackendAllowed(value) &&
														t("volumes.createVolumeForm.unavailableOnThisServer")}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										<span className={cn({ hidden: runtime !== "server" || capabilities.sysAdmin })}>
											{t("volumes.createVolumeForm.networkSourcesRequireA")}
										</span>
										<span
											className={cn({ hidden: runtime === "server" && !capabilities.sysAdmin })}
										>
											{t("volumes.createVolumeForm.chooseHowZerobyteAccesses")}
										</span>
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}
					{watchedBackend === "directory" && <DirectoryForm form={form} />}
					{watchedBackend === "nfs" && <NFSForm form={form} />}
					{watchedBackend === "webdav" && <WebDAVForm form={form} />}
					{watchedBackend === "smb" && <SMBForm form={form} />}
					{watchedBackend === "rclone" && <RcloneForm form={form} />}
					{watchedBackend === "sftp" && <SFTPForm form={form} />}
				</fieldset>
				{watchedBackend && watchedBackend !== "directory" && watchedBackend !== "rclone" && (
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={handleTestConnection}
								disabled={testBackendConnection.isPending}
								className="flex-1"
							>
								<span className={cn("flex items-center", { hidden: !testBackendConnection.isPending })}>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("volumes.createVolumeForm.testing")}
								</span>
								<span
									className={cn("flex items-center", {
										hidden: testBackendConnection.isPending || !testMessage?.success,
									})}
								>
									<CheckCircle className="mr-2 h-4 w-4 text-success" />
									{t("volumes.createVolumeForm.connectionSuccessful")}
								</span>
								<span
									className={cn("flex items-center", {
										hidden: testBackendConnection.isPending || !testMessage || testMessage.success,
									})}
								>
									<XCircle className="mr-2 h-4 w-4 text-red-500" />
									{t("volumes.createVolumeForm.testFailed")}
								</span>
								<span
									className={cn("flex items-center", {
										hidden: testBackendConnection.isPending || !!testMessage,
									})}
								>
									<Plug className="mr-2 h-4 w-4" />
									{t("volumes.createVolumeForm.testConnection")}
								</span>
							</Button>
						</div>
						{testMessage && (
							<div
								className={cn("text-xs p-2 rounded-md text-wrap wrap-anywhere", {
									"bg-success/10 text-success border border-success/30": testMessage.success,
									"bg-red-50 text-red-700 border border-red-200": !testMessage.success,
								})}
							>
								{testMessage.message}
							</div>
						)}
					</div>
				)}
				{mode === "update" && !formId && (
					<Button type="submit" className="w-full" loading={loading}>
						<Save className="h-4 w-4 mr-2" />
						{t("volumes.createVolumeForm.saveChanges")}
					</Button>
				)}
			</form>
		</Form>
	);
};
