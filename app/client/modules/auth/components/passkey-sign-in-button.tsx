import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Fingerprint } from "lucide-react";
import { Button } from "~/client/components/ui/button";
import { authClient } from "~/client/lib/auth-client";
import { logger } from "~/client/lib/logger";
import { LOGIN_ERROR_CODES, PASSKEY_LOGIN_FAILED_ERROR, type LoginErrorCode } from "~/lib/sso-errors";
import { useTranslation } from "~/client/lib/i18n";

type PasskeySignInButtonProps = {
	onSignIn: () => Promise<void>;
};

type PasskeySignInError = {
	code?: string;
	message?: string;
	status?: number;
	statusText?: string;
};

const LOGIN_ERROR_CODE_SET = new Set<string>(LOGIN_ERROR_CODES);

function getPasskeyLoginErrorCode(code: string | undefined): LoginErrorCode {
	if (code && LOGIN_ERROR_CODE_SET.has(code)) {
		return code as LoginErrorCode;
	}

	return PASSKEY_LOGIN_FAILED_ERROR;
}

export function PasskeySignInButton({ onSignIn }: PasskeySignInButtonProps) {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const passkeyLoginMutation = useMutation<void, PasskeySignInError>({
		mutationFn: async () => {
			const { error } = await authClient.signIn.passkey();
			if (error) throw error;

			await onSignIn();
		},
		onError: (error) => {
			logger.error(error);

			void navigate({
				to: "/login",
				search: {
					error: getPasskeyLoginErrorCode(error.code),
				},
			});
		},
	});

	return (
		<Button
			type="button"
			variant="outline"
			className="w-full"
			loading={passkeyLoginMutation.isPending}
			disabled={passkeyLoginMutation.isPending}
			onClick={() => passkeyLoginMutation.mutate()}
		>
			<Fingerprint className="h-4 w-4 mr-2" />
			{t("auth.signInWithPasskey")}
		</Button>
	);
}
