import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthLayout } from "~/client/components/auth-layout";
import { Button } from "~/client/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "~/client/components/ui/input-otp";
import { Label } from "~/client/components/ui/label";
import { authClient } from "~/client/lib/auth-client";
import { logger } from "~/client/lib/logger";
import { cn } from "~/client/lib/utils";
import { decodeLoginError } from "~/client/lib/sso-errors";
import { getLoginOptions } from "~/server/lib/functions/login-options";
import { RECOVERY_KEY_DOWNLOAD_SKIPPED_COOKIE_NAME } from "~/lib/recovery-key-skip";
import { type LoginErrorCode, PASSKEY_LOGIN_FAILED_ERROR } from "~/lib/sso-errors";
import { normalizeUsername } from "~/lib/username";
import { ResetPasswordDialog } from "../components/reset-password-dialog";
import { AlternativeSignInSection } from "../components/alternative-sign-in-section";
import { z } from "zod";
import { type TFunction, type TranslationKey, useTranslation } from "~/client/lib/i18n";

const createLoginSchema = (t: TFunction) =>
	z.object({
		username: z.string().min(2, t("auth.usernameMin")).max(50, t("auth.usernameMax")),
		password: z.string().min(1, t("auth.passwordRequired")),
	});

type LoginFormValues = z.input<ReturnType<typeof createLoginSchema>>;

const loginErrorKeys = {
	ACCOUNT_LINK_REQUIRED: "auth.loginErrors.accountLinkRequired",
	EMAIL_NOT_VERIFIED: "auth.loginErrors.emailNotVerified",
	INVITE_REQUIRED: "auth.loginErrors.inviteRequired",
	BANNED_USER: "auth.loginErrors.bannedUser",
	SSO_LOGIN_FAILED: "auth.loginErrors.ssoLoginFailed",
	[PASSKEY_LOGIN_FAILED_ERROR]: "auth.loginErrors.passkeyLoginFailed",
	ERROR_INVALID_RP_ID: "auth.loginErrors.invalidRpId",
} as const satisfies Record<LoginErrorCode, TranslationKey>;

type LoginPageProps = {
	error?: string;
};

type PasskeySignInError = {
	code?: string;
	message?: string;
	status?: number;
	statusText?: string;
};

function isPasskeyVerificationFailure(error: PasskeySignInError | null) {
	return error?.code === "AUTHENTICATION_FAILED" || error?.code === "UNAUTHORIZED";
}

function hasSkippedRecoveryKeyDownload(userId: string) {
	return document.cookie
		.split(";")
		.some((cookie) => cookie.trim() === `${RECOVERY_KEY_DOWNLOAD_SKIPPED_COOKIE_NAME}=${userId}`);
}

export function LoginPage({ error }: LoginPageProps = {}) {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const getOptions = useServerFn(getLoginOptions);
	const { data: loginOptions } = useSuspenseQuery({
		queryKey: ["login-options"],
		queryFn: getOptions,
	});
	const [showResetDialog, setShowResetDialog] = useState(false);
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const [requires2FA, setRequires2FA] = useState(false);
	const [totpCode, setTotpCode] = useState("");
	const [isVerifying2FA, setIsVerifying2FA] = useState(false);
	const [trustDevice, setTrustDevice] = useState(false);
	const errorCode = decodeLoginError(error);
	const errorDescription = errorCode ? t(loginErrorKeys[errorCode]) : null;

	const navigateAfterLogin = useCallback(async () => {
		const session = await authClient.getSession();

		if (
			session.data?.user &&
			!session.data.user.hasDownloadedResticPassword &&
			!hasSkippedRecoveryKeyDownload(session.data.user.id)
		) {
			void navigate({ to: "/download-recovery-key" });
		} else {
			void navigate({ to: "/volumes" });
		}
	}, [navigate]);

	useEffect(() => {
		const autoSignIn = async () => {
			if (
				typeof PublicKeyCredential === "undefined" ||
				!PublicKeyCredential.isConditionalMediationAvailable ||
				!(await PublicKeyCredential.isConditionalMediationAvailable())
			) {
				return;
			}

			const { data, error } = await authClient.signIn.passkey({
				autoFill: true,
			});

			if (isPasskeyVerificationFailure(error)) {
				void navigate({
					to: "/login",
					search: {
						error: PASSKEY_LOGIN_FAILED_ERROR,
					},
				});
				return;
			}

			if (data) {
				await navigateAfterLogin();
			}
		};

		void autoSignIn();
	}, [navigate, navigateAfterLogin]);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(createLoginSchema(t)),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const onSubmit = async (values: LoginFormValues) => {
		const { data, error } = await authClient.signIn.username({
			username: normalizeUsername(values.username),
			password: values.password,
			fetchOptions: {
				onRequest: () => {
					setIsLoggingIn(true);
				},
				onResponse: () => {
					setIsLoggingIn(false);
				},
			},
		});

		if (error) {
			logger.error(error);
			toast.error(t("auth.loginFailed"), { description: error.message });
			return;
		}

		if ("twoFactorRedirect" in data && data.twoFactorRedirect) {
			setRequires2FA(true);
			return;
		}

		await navigateAfterLogin();
	};

	const handleVerify2FA = async () => {
		if (totpCode.length !== 6) {
			toast.error(t("auth.enterSixDigitCode"));
			return;
		}

		const { data, error } = await authClient.twoFactor.verifyTotp({
			code: totpCode,
			trustDevice,
			fetchOptions: {
				onRequest: () => {
					setIsVerifying2FA(true);
				},
				onResponse: () => {
					setIsVerifying2FA(false);
				},
			},
		});

		if (error) {
			logger.error(error);
			toast.error(t("auth.verificationFailed"), { description: error.message });
			setTotpCode("");
			return;
		}

		if (data) {
			toast.success(t("auth.loginSuccessful"));
			const session = await authClient.getSession();
			if (
				session.data?.user &&
				!session.data.user.hasDownloadedResticPassword &&
				!hasSkippedRecoveryKeyDownload(session.data.user.id)
			) {
				void navigate({ to: "/download-recovery-key" });
			} else {
				void navigate({ to: "/volumes" });
			}
		}
	};

	const handleBackToLogin = () => {
		setRequires2FA(false);
		setTotpCode("");
		setTrustDevice(false);
		form.reset();
	};

	if (requires2FA) {
		return (
			<AuthLayout title={t("auth.twoFactorTitle")} description={t("auth.twoFactorDescription")}>
				<div className="space-y-6">
					<div className="space-y-4 flex flex-col items-center">
						<Label htmlFor="totp-code">{t("auth.authenticationCode")}</Label>
						<div>
							<InputOTP
								maxLength={6}
								value={totpCode}
								onChange={setTotpCode}
								onComplete={handleVerify2FA}
								disabled={isVerifying2FA}
							>
								<InputOTPGroup>
									<InputOTPSlot index={0} />
									<InputOTPSlot index={1} />
									<InputOTPSlot index={2} />
								</InputOTPGroup>
								<InputOTPSeparator />
								<InputOTPGroup>
									<InputOTPSlot index={3} />
									<InputOTPSlot index={4} />
									<InputOTPSlot index={5} />
								</InputOTPGroup>
							</InputOTP>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="trust-device"
							aria-label={t("auth.trustDevice")}
							checked={trustDevice}
							onChange={(e) => setTrustDevice(e.target.checked)}
							className="h-4 w-4"
						/>
						<label htmlFor="trust-device" className="text-sm text-muted-foreground cursor-pointer">
							{t("auth.trustDevice")}
						</label>
					</div>

					<div className="space-y-2">
						<Button
							type="button"
							className="w-full"
							loading={isVerifying2FA}
							onClick={handleVerify2FA}
							disabled={totpCode.length !== 6}
						>
							{t("auth.verify")}
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={handleBackToLogin}
							disabled={isVerifying2FA}
						>
							{t("auth.backToLogin")}
						</Button>
					</div>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout title={t("auth.loginTitle")} description={t("auth.loginDescription")}>
			<div
				className={cn("rounded-md border border-destructive/50 p-3 text-sm", {
					hidden: !errorDescription,
				})}
			>
				{errorDescription}
			</div>

			{loginOptions.passwordLoginEnabled && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("auth.username")}</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="text"
											placeholder="admin"
											disabled={isLoggingIn}
											autoComplete="username webauthn"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center justify-between">
										<FormLabel>{t("auth.password")}</FormLabel>
										<button
											type="button"
											className="text-xs text-muted-foreground hover:underline"
											onClick={() => setShowResetDialog(true)}
										>
											{t("auth.forgotPassword")}
										</button>
									</div>
									<FormControl>
										<Input
											{...field}
											type="password"
											disabled={isLoggingIn}
											autoComplete="current-password webauthn"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full" loading={isLoggingIn}>
							{t("auth.login")}
						</Button>
					</form>
				</Form>
			)}

			<AlternativeSignInSection
				hasPasskeySignIn={loginOptions.hasPasskeySignIn}
				onPasskeySignIn={navigateAfterLogin}
			/>

			<ResetPasswordDialog open={showResetDialog} onOpenChange={setShowResetDialog} />
		</AuthLayout>
	);
}
