import { createFileRoute } from "@tanstack/react-router";
import { getNotificationDestinationOptions } from "~/client/api-client/@tanstack/react-query.gen";
import { NotificationDetailsPage } from "~/client/modules/notifications/routes/notification-details";

export const Route = createFileRoute("/(dashboard)/notifications/$notificationId/")({
	component: RouteComponent,
	errorComponent: () => <div>Failed to load notification</div>,
	loader: async ({ params, context }) => {
		const res = await context.queryClient.ensureQueryData({
			...getNotificationDestinationOptions({ path: { id: params.notificationId } }),
		});

		return res;
	},
	staticData: {
		breadcrumb: (match, t) => [
			{ label: t("nav.notifications"), href: "/notifications" },
			{ label: match.loaderData?.name || t("breadcrumb.notificationDetails") },
		],
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: `Zerobyte - ${loaderData?.name}` },
			{
				name: "description",
				content: "View notification destination settings.",
			},
		],
	}),
});

function RouteComponent() {
	return <NotificationDetailsPage notificationId={Route.useParams().notificationId} />;
}
