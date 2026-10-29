import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useId } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Save } from "lucide-react";
import { toast } from "sonner";
import {
	getNotificationDestinationOptions,
	updateNotificationDestinationMutation,
} from "~/client/api-client/@tanstack/react-query.gen";
import { Alert, AlertDescription } from "~/client/components/ui/alert";
import { Button } from "~/client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/client/components/ui/card";
import { parseError } from "~/client/lib/errors";
import { CreateNotificationForm, type NotificationFormValues } from "../components/create-notification-form";
import { useTranslation } from "~/client/lib/i18n";

export function EditNotificationPage({ notificationId }: { notificationId: string }) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const formId = useId();

	const { data } = useSuspenseQuery({
		...getNotificationDestinationOptions({ path: { id: notificationId } }),
	});

	const updateDestination = useMutation({
		...updateNotificationDestinationMutation(),
		onSuccess: () => {
			toast.success(t("notifications.editNotification.notificationDestinationUpdatedSuccessfully"));
			void navigate({ to: `/notifications/${data.id}` });
		},
		onError: (error) => {
			toast.error(t("notifications.editNotification.failedToUpdateNotification"), {
				description: parseError(error)?.message,
			});
		},
	});

	const handleSubmit = (values: NotificationFormValues) => {
		updateDestination.mutate({
			path: { id: String(data.id) },
			body: {
				name: values.name,
				config: values,
			},
		});
	};

	return (
		<div className="container mx-auto space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
							<Bell className="w-5 h-5 text-primary" />
						</div>
						<CardTitle>{t("notifications.editNotification.editNotificationDestination")}</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{updateDestination.isError && (
						<Alert variant="destructive">
							<AlertDescription>
								<strong>{t("notifications.editNotification.failedToUpdateNotification2")}</strong>
								<br />
								{parseError(updateDestination.error)?.message}
							</AlertDescription>
						</Alert>
					)}
					<CreateNotificationForm
						mode="update"
						formId={formId}
						onSubmit={handleSubmit}
						initialValues={{
							...data.config,
							name: data.name,
						}}
					/>
					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button
							type="button"
							variant="secondary"
							onClick={() => navigate({ to: `/notifications/${data.id}` })}
						>
							{t("common.cancel")}
						</Button>
						<Button type="submit" form={formId} loading={updateDestination.isPending}>
							<Save className="h-4 w-4 mr-2" />
							{t("repositories.createRepositoryForm.saveChanges")}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
