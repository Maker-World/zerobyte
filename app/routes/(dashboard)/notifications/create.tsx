import { createFileRoute } from "@tanstack/react-router";
import { CreateNotificationPage } from "~/client/modules/notifications/routes/create-notification";

export const Route = createFileRoute("/(dashboard)/notifications/create")({
	component: RouteComponent,
	errorComponent: () => <div>Failed to load notification creation</div>,
	staticData: {
		breadcrumb: (_match, t) => [
			{ label: t("nav.notifications"), href: "/notifications" },
			{ label: t("common.create") },
		],
	},
	head: () => ({
		meta: [
			{ title: "Zerobyte - Create Notification" },
			{
				name: "description",
				content: "Create a new notification destination for backup alerts.",
			},
		],
	}),
});

function RouteComponent() {
	return <CreateNotificationPage />;
}
