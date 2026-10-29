import { createFileRoute } from "@tanstack/react-router";
import { getNotificationDestinationOptions } from "~/client/api-client/@tanstack/react-query.gen";
import { EditNotificationPage } from "~/client/modules/notifications/routes/edit-notification";

export const Route = createFileRoute("/(dashboard)/notifications/$notificationId/edit")({
	component: RouteComponent,
	errorComponent: () => <div>Failed to load notification</div>,
	loader: async ({ params, context }) => {
		const notification = await context.queryClient.ensureQueryData({
			...getNotificationDestinationOptions({ path: { id: params.notificationId } }),
		});

		return notification;
	},
	staticData: {
		breadcrumb: (match, t) => [
			{ label: t("nav.notifications"), href: "/notifications" },
			{
				label: match.loaderData?.name || t("breadcrumb.notificationDetails"),
				href: `/notifications/${match.params.notificationId}`,
			},
			{ label: t("common.edit") },
		],
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: `Zerobyte - Edit ${loaderData?.name}` },
			{
				name: "description",
				content: "Edit notification destination settings.",
			},
		],
	}),
});

function RouteComponent() {
	return <EditNotificationPage notificationId={Route.useParams().notificationId} />;
}
