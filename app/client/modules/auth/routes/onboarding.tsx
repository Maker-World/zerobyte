import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/client/components/ui/form";
import { AuthLayout } from "~/client/components/auth-layout";
import { Input } from "~/client/components/ui/input";
import { Button } from "~/client/components/ui/button";
import { authClient } from "~/client/lib/auth-client";
import { logger } from "~/client/lib/logger";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { normalizeUsername } from "~/lib/username";
import { z } from "zod";
import { inferDateTimePreferences } from "~/client/lib/datetime";
import { useTranslation } from "~/client/lib/i18n";

const onboardingSchema = z.object({
	username: z.string().min(2).max(30).transform(normalizeUsername),
	email: z
		.string()
		.email()
		.transform((str) => str.trim().toLowerCase()),
	password: z.string().min(8),
	confirmPassword: z.string().min(1),
});

type OnboardingFormValues = z.input<typeof onboardingSchema>;

export function OnboardingPage() {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [submitting, setSubmitting] = useState(false);

	const form = useForm<OnboardingFormValues>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			username: "",
			password: "",
			confirmPassword: "",
			email: "",
		},
	});

	const onSubmit = async (values: OnboardingFormValues) => {
		if (values.password !== values.confirmPassword) {
			form.setError("confirmPassword", {
				type: "manual",
				message: t("auth.passwordsDoNotMatch"),
			});
			return;
		}

		const { dateFormat, timeFormat } = inferDateTimePreferences(navigator.language);

		const { data, error } = await authClient.signUp.email({
			username: normalizeUsername(values.username),
			dateFormat,
			timeFormat,
			password: values.password,
			email: values.email.toLowerCase().trim(),
			name: values.username,
			displayUsername: values.username,
			hasDownloadedResticPassword: false,
			fetchOptions: {
				onRequest: () => {
					setSubmitting(true);
				},
				onResponse: () => {
					setSubmitting(false);
				},
			},
		});

		if (data?.token) {
			toast.success(t("auth.onboarding.created"));
			void navigate({ to: "/download-recovery-key" });
		} else if (error) {
			logger.error(error);
			const errorMessage = error.message ?? t("common.unknownError");
			toast.error(t("auth.onboarding.createFailed"), { description: errorMessage });
		}
	};

	return (
		<AuthLayout title={t("auth.onboarding.title")} description={t("auth.onboarding.description")}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("auth.email")}</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="email"
										placeholder="you@example.com"
										disabled={submitting}
									/>
								</FormControl>
								<FormDescription>{t("auth.onboarding.emailDescription")}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("auth.username")}</FormLabel>
								<FormControl>
									<Input {...field} type="text" placeholder="admin" disabled={submitting} />
								</FormControl>
								<FormDescription>{t("auth.onboarding.usernameDescription")}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("auth.password")}</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="password"
										placeholder={t("auth.onboarding.passwordPlaceholder")}
										disabled={submitting}
									/>
								</FormControl>
								<FormDescription>{t("auth.onboarding.passwordDescription")}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("auth.confirmPassword")}</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="password"
										placeholder={t("auth.onboarding.confirmPasswordPlaceholder")}
										disabled={submitting}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full" loading={submitting}>
						{t("auth.onboarding.submit")}
					</Button>
				</form>
			</Form>
		</AuthLayout>
	);
}
