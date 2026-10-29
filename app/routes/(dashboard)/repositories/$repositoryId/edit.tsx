import { createFileRoute } from "@tanstack/react-router";
import { RouteError } from "~/client/components/route-error";
import { getRepositoryOptions } from "~/client/api-client/@tanstack/react-query.gen";
import { EditRepositoryPage } from "~/client/modules/repositories/routes/edit-repository";

export const Route = createFileRoute("/(dashboard)/repositories/$repositoryId/edit")({
	component: RouteComponent,
	errorComponent: RouteError,
	loader: async ({ params, context }) => {
		const repository = await context.queryClient.ensureQueryData({
			...getRepositoryOptions({ path: { shortId: params.repositoryId } }),
		});

		return repository;
	},
	staticData: {
		breadcrumb: (match, t) => [
			{ label: t("nav.repositories"), href: "/repositories" },
			{
				label: match.loaderData?.name || t("breadcrumb.repository"),
				href: `/repositories/${match.params.repositoryId}`,
			},
			{ label: t("common.edit") },
		],
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: `Zerobyte - Edit ${loaderData?.name ?? "Repository"}` },
			{
				name: "description",
				content: "Edit repository configuration.",
			},
		],
	}),
});

function RouteComponent() {
	const { repositoryId } = Route.useParams();

	return <EditRepositoryPage repositoryId={repositoryId} />;
}
