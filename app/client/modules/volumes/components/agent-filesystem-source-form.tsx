import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { listSourceMachinesOptions } from "~/client/api-client/@tanstack/react-query.gen";
import { Alert, AlertAction, AlertContent, AlertDescription } from "~/client/components/ui/alert";
import { Button } from "~/client/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import { useScrollToFormError } from "~/client/hooks/use-scroll-to-form-error";
import { getMachineStatus, isMachineAvailable, machineStatusLabels } from "~/client/lib/machine-status";
import { cn } from "~/client/lib/utils";
import { TrustedRootBrowser } from "./trusted-root-browser";
import { useTranslation } from "~/client/lib/i18n";

const filesystemSourceSchema = z.object({
	name: z.string().trim().min(2).max(32),
	agentId: z.string().min(1, "Choose a machine"),
	trustedRootId: z.string().min(1, "Choose an allowed location"),
	relativePath: z
		.string()
		.nullable()
		.pipe(z.string({ error: "Choose the entire location or a folder" })),
});

export type FilesystemSourceValues = z.output<typeof filesystemSourceSchema>;

type Props = {
	formId: string;
	initialValues?: FilesystemSourceValues;
	onSubmit: (values: FilesystemSourceValues) => void;
};

export const AgentFilesystemSourceForm = ({ formId, initialValues, onSubmit }: Props) => {
	const { t } = useTranslation();
	const form = useForm<z.input<typeof filesystemSourceSchema>, unknown, FilesystemSourceValues>({
		resolver: zodResolver(filesystemSourceSchema),
		defaultValues: initialValues ?? { name: "", agentId: "", trustedRootId: "", relativePath: null },
	});
	const scrollToFirstError = useScrollToFormError();

	const machinesQuery = useQuery(listSourceMachinesOptions());

	const [agentId, trustedRootId] = useWatch({ control: form.control, name: ["agentId", "trustedRootId"] });
	const machines = machinesQuery.data ?? [];
	const machine = machines.find((item) => item.id === agentId);
	const root = machine?.trustedRoots.find((item) => item.id === trustedRootId);
	const machineIsOnline = machine !== undefined && isMachineAvailable(machine);

	return (
		<Form {...form}>
			<form id={formId} onSubmit={form.handleSubmit(onSubmit, scrollToFirstError)} className="space-y-4">
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
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{machinesQuery.isError && (
					<Alert variant="destructive">
						<AlertContent>
							<AlertDescription>
								{t("volumes.agentFilesystemSourceForm.machinesCouldNotBe")}
							</AlertDescription>
						</AlertContent>
						<AlertAction>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => void machinesQuery.refetch()}
							>
								{t("settings.machinesSection.retry")}
							</Button>
						</AlertAction>
					</Alert>
				)}
				{machinesQuery.isPending && (
					<p className="text-sm text-muted-foreground">
						{t("volumes.agentFilesystemSourceForm.loadingMachines")}
					</p>
				)}

				{machinesQuery.isSuccess && (
					<>
						<FormField
							control={form.control}
							name="agentId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("volumes.info.machine")}</FormLabel>
									<Select
										value={field.value}
										onValueChange={(value) => {
											field.onChange(value);
											form.setValue("trustedRootId", "");
											form.setValue("relativePath", null);
										}}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue
													placeholder={t("volumes.agentFilesystemSourceForm.chooseAMachine")}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{machines.map((item) => (
												<SelectItem
													key={item.id}
													value={item.id}
													disabled={!isMachineAvailable(item)}
												>
													{item.name} · {machineStatusLabels[getMachineStatus(item)]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{(machines.length === 0 || machine?.trustedRoots.length === 0) && (
							<p className="text-sm text-muted-foreground">
								<span className={cn({ hidden: machines.length > 0 })}>
									{t("volumes.agentFilesystemSourceForm.noMachinesAreConnected")}
								</span>
								<span className={cn({ hidden: machines.length === 0 })}>
									{t("volumes.agentFilesystemSourceForm.thisMachineDoesNot", { name: machine?.name })}
									<code>sudo zerobyte-agent folders add</code>{" "}
									{t("volumes.agentFilesystemSourceForm.toChooseFolders")}
								</span>{" "}
								<Link
									to="/settings"
									search={{ scope: "organization" }}
									hash="machines"
									className="underline underline-offset-4"
								>
									{t("volumes.agentFilesystemSourceForm.manageMachines")}
								</Link>
							</p>
						)}

						{machine && machine.trustedRoots.length > 0 && (
							<FormField
								control={form.control}
								name="trustedRootId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("volumes.agentFilesystemSourceForm.allowedLocation")}</FormLabel>
										<Select
											value={field.value}
											disabled={!machineIsOnline}
											onValueChange={(value) => {
												field.onChange(value);
												form.setValue("relativePath", null);
											}}
										>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue
														placeholder={t(
															"volumes.agentFilesystemSourceForm.chooseAnAllowedLocation",
														)}
													/>
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{machine.trustedRoots.map((item) => (
													<SelectItem
														key={item.id}
														value={item.id}
														disabled={!item.canBackup}
													>
														{item.label}
														{!item.canBackup &&
															t("volumes.agentFilesystemSourceForm.backupsDisabled")}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{root && (
							<FormField
								control={form.control}
								name="relativePath"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("volumes.info.folder")}</FormLabel>
										<TrustedRootBrowser
											key={`${agentId}:${trustedRootId}`}
											agentId={agentId}
											rootId={trustedRootId}
											rootLabel={root.label}
											value={field.value}
											disabled={!machineIsOnline}
											onChange={field.onChange}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
					</>
				)}

				<p className="text-xs text-muted-foreground">
					{t("volumes.agentFilesystemSourceForm.onlyFoldersSharedBy")}
					{initialValues && t("volumes.agentFilesystemSourceForm.existingBackupSchedulesFollow")}
				</p>
			</form>
		</Form>
	);
};
