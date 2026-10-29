import { Outlet, HeadContent, Scripts, createRootRouteWithContext, useLocation } from "@tanstack/react-router";
import appCss from "../app.css?url";
import { apiClientMiddleware } from "~/middleware/api-client";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "~/client/components/ui/sonner";
import { RouteError } from "~/client/components/route-error";
import { useServerEvents } from "~/client/hooks/use-server-events";
import { useEffect } from "react";
import { DEFAULT_THEME, THEME_COOKIE_NAME, ThemeProvider, type Theme } from "~/client/components/theme-provider";
import { isAuthRoute } from "~/lib/auth-routes";
import { getRootLoaderData } from "~/server/lib/functions/root-loader-data";
import { useCookieState } from "~/client/hooks/use-cookie-state";
import { I18nProvider, LANGUAGE_COOKIE_NAME, type Language, resolveLanguage } from "~/client/lib/i18n";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
	server: {
		middleware: [apiClientMiddleware],
	},
	loader: async () => getRootLoaderData(),
	head: () => ({
		meta: [{ title: "Zerobyte - Open Source Backup Solution" }, { name: "robots", content: "noindex, nofollow" }],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	component: RootLayout,
	errorComponent: RouteError,
});

function RootLayout() {
	const [theme, setTheme] = useCookieState<Theme>(THEME_COOKIE_NAME, DEFAULT_THEME);
	const { locale } = Route.useLoaderData();
	const [storedLanguage, setLanguage] = useCookieState<Language>(LANGUAGE_COOKIE_NAME, resolveLanguage(locale));
	const language = resolveLanguage(storedLanguage);
	const pathname = useLocation({ select: (location) => location.pathname });
	const isDesktopTrayRoute = pathname === "/desktop/tray";
	useServerEvents({ enabled: !isAuthRoute(pathname) });
	useEffect(() => {
		document.body.setAttribute("data-app-ready", "true");
		window.addEventListener("vite:preloadError", () => {
			window.location.reload();
		});

		return () => {
			document.body.removeAttribute("data-app-ready");
		};
	}, []);

	return (
		<html lang={language} className={theme === "dark" ? "dark" : undefined} style={{ colorScheme: theme }}>
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
				/>
				<link rel="icon" type="image/png" href="/images/favicon/favicon-96x96.png" sizes="96x96" />
				<link rel="icon" type="image/svg+xml" href="/images/favicon/favicon.svg" />
				<link rel="shortcut icon" href="/images/favicon/favicon.ico" />
				<link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-touch-icon.png" />
				<meta name="apple-mobile-web-app-title" content="Zerobyte" />
				<link rel="manifest" href="/images/favicon/site.webmanifest" />
				<HeadContent />
			</head>
			<body>
				<I18nProvider language={language} setLanguage={setLanguage}>
					<ThemeProvider theme={theme} setTheme={setTheme}>
						<Outlet />
						{!isDesktopTrayRoute && <Toaster />}
						{!isDesktopTrayRoute && <ReactQueryDevtools buttonPosition="bottom-right" />}
					</ThemeProvider>
				</I18nProvider>
				<Scripts />
			</body>
		</html>
	);
}
