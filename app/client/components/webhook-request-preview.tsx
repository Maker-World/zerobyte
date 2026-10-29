import { CodeBlock } from "~/client/components/ui/code-block";
import { Label } from "~/client/components/ui/label";
import { useTranslation } from "~/client/lib/i18n";

type WebhookRequestPreviewProps = {
	method: string;
	url?: string;
	contentType?: string;
	headers?: string[];
	body: string;
};

export const WebhookRequestPreview = ({ method, url, contentType, headers, body }: WebhookRequestPreviewProps) => {
	const { t } = useTranslation();
	const headerLines = [contentType ? `Content-Type: ${contentType}` : undefined, ...(headers ?? [])].filter(Boolean);
	const previewCode = `${method} ${url || "https://api.example.com/webhook"}${headerLines.length > 0 ? `\n${headerLines.join("\n")}` : ""}

${body}`;

	return (
		<div className="space-y-2 pt-4 border-t">
			<Label>{t("components.webhookRequestPreview.requestPreview")}</Label>
			<CodeBlock code={previewCode} filename="HTTP Request" />
			<p className="text-[0.8rem] text-muted-foreground">
				{t("components.webhookRequestPreview.thisIsAPreview")}
			</p>
		</div>
	);
};
