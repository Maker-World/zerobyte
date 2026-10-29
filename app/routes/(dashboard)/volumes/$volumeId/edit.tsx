import { createFileRoute } from "@tanstack/react-router";
import { RouteError } from "~/client/components/route-error";
import { getVolumeOptions } from "~/client/api-client/@tanstack/react-query.gen";
import { EditVolumePage } from "~/client/modules/volumes/routes/edit-volume";

export const Route = createFileRoute("/(dashboard)/volumes/$volumeId/edit")({
	component: RouteComponent,
	errorComponent: RouteError,
	loader: async ({ params, context }) => {
		const volume = await context.queryClient.ensureQueryData({
			...getVolumeOptions({ path: { shortId: params.volumeId } }),
		});

		return volume;
	},
	staticData: {
		breadcrumb: (match, t) => [
			{ label: t("nav.sources"), href: "/volumes" },
			{
				label: match.loaderData?.volume.name || t("breadcrumb.source"),
				href: `/volumes/${match.params.volumeId}`,
			},
			{ label: t("common.edit") },
		],
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: `Zerobyte - Edit ${loaderData?.volume.name ?? "Source"}` },
			{
				name: "description",
				content: "Edit source configuration.",
			},
		],
	}),
});

function RouteComponent() {
	const { volumeId } = Route.useParams();

	return <EditVolumePage volumeId={volumeId} />;
}
