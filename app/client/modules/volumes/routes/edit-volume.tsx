import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { HardDrive, Check, Save } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { getVolumeOptions, updateVolumeMutation } from "~/client/api-client/@tanstack/react-query.gen";
import { type UpdateVolumeResponse } from "~/client/api-client/types.gen";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/client/components/ui/alert-dialog";
import { Alert, AlertDescription } from "~/client/components/ui/alert";
import { Button } from "~/client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/client/components/ui/card";
import { parseError } from "~/client/lib/errors";
import { useNavigate } from "@tanstack/react-router";
import { ManagedBadge } from "~/client/components/managed-badge";
import { CreateVolumeForm, formSchema, type FormValues } from "../components/create-volume-form";
import { AgentFilesystemSourceForm, type FilesystemSourceValues } from "../components/agent-filesystem-source-form";
import { useTranslation } from "~/client/lib/i18n";

export function EditVolumePage({ volumeId }: { volumeId: string }) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const formId = useId();

	const [open, setOpen] = useState(false);
	const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

	const { data } = useSuspenseQuery({
		...getVolumeOptions({ path: { shortId: volumeId } }),
	});

	const { volume } = data;

	const updateVolume = useMutation({
		...updateVolumeMutation(),
		onSuccess: (updatedVolume: UpdateVolumeResponse) => {
			toast.success(t("volumes.editVolume.sourceUpdatedSuccessfully"));
			setOpen(false);
			setPendingValues(null);
			void navigate({ to: `/volumes/${updatedVolume.shortId}` });
		},
		onError: (error) => {
			toast.error(t("volumes.editVolume.failedToUpdateSource"), {
				description: parseError(error)?.message,
			});
			setOpen(false);
			setPendingValues(null);
		},
	});

	const handleSubmit = (values: FormValues) => {
		setPendingValues(values);
		setOpen(true);
	};

	const confirmUpdate = () => {
		if (!pendingValues) {
			return;
		}

		const { name, ...config } = formSchema.parse(pendingValues);

		updateVolume.mutate({
			path: { shortId: volume.shortId },
			body: { name, config },
		});
	};

	const updateFilesystemSource = (values: FilesystemSourceValues) => {
		updateVolume.mutate({ path: { shortId: volume.shortId }, body: values });
	};

	return (
		<>
			<div className="container mx-auto space-y-6">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
								<HardDrive className="w-5 h-5 text-primary" />
							</div>
							<div className="flex items-center gap-2">
								<CardTitle>{t("volumes.editVolume.editSource")}</CardTitle>
								{volume.provisioningId && <ManagedBadge />}
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						{updateVolume.isError && (
							<Alert variant="destructive">
								<AlertDescription>
									<strong>{t("volumes.editVolume.failedToUpdateSource2")}</strong>
									<br />
									{parseError(updateVolume.error)?.message}
								</AlertDescription>
							</Alert>
						)}
						{volume.sourceKind === "managed" && (
							<CreateVolumeForm
								mode="update"
								formId={formId}
								initialValues={{ ...volume, ...volume.config }}
								onSubmit={handleSubmit}
								loading={updateVolume.isPending}
							/>
						)}
						{volume.sourceKind !== "managed" && (
							<AgentFilesystemSourceForm
								formId={formId}
								initialValues={volume}
								onSubmit={updateFilesystemSource}
							/>
						)}
						<div className="flex justify-end gap-2 pt-4 border-t">
							<Button
								type="button"
								variant="secondary"
								onClick={() => navigate({ to: `/volumes/${volume.shortId}` })}
							>
								{t("common.cancel")}
							</Button>
							<Button type="submit" form={formId} loading={updateVolume.isPending}>
								<Save className="h-4 w-4 mr-2" />
								{t("volumes.createVolumeForm.saveChanges")}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
			{volume.sourceKind === "managed" && (
				<AlertDialog open={open} onOpenChange={setOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>{t("volumes.editVolume.updateSourceConfiguration")}</AlertDialogTitle>
							<AlertDialogDescription>
								{t("volumes.editVolume.editingTheSourceWill")}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
							<AlertDialogAction onClick={confirmUpdate} disabled={updateVolume.isPending}>
								<Check className="h-4 w-4" />
								{t("volumes.editVolume.update")}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</>
	);
}
