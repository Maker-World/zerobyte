import { createFileRoute } from "@tanstack/react-router";
import { CreateVolumePage } from "~/client/modules/volumes/routes/create-volume";

export const Route = createFileRoute("/(dashboard)/volumes/create")({
	component: RouteComponent,
	errorComponent: () => <div>Failed to load source creation</div>,
	staticData: {
		breadcrumb: (_match, t) => [{ label: t("nav.sources"), href: "/volumes" }, { label: t("common.create") }],
	},
	head: () => ({
		meta: [
			{ title: "Zerobyte - Create Source" },
			{
				name: "description",
				content: "Create a new source for files and folders you want to back up.",
			},
		],
	}),
});

function RouteComponent() {
	return <CreateVolumePage />;
}
