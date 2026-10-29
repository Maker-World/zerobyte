import { useEffect, useMemo, useState } from "react";
import { zhCN } from "date-fns/locale/zh-CN";
import { useRootLoaderData } from "~/client/hooks/use-root-loader-data";
import { useTranslation } from "~/client/lib/i18n";
import { rawFormatters, type DateInput } from "~/lib/datetime";

export {
	DATE_FORMATS,
	DEFAULT_TIME_FORMAT,
	formatDuration,
	inferDateTimePreferences,
	rawFormatters,
	TIME_FORMATS,
} from "~/lib/datetime";
export type { DateFormatPreference, DateInput, TimeFormatPreference } from "~/lib/datetime";

export function useTimeFormat() {
	const { locale: requestLocale, timeZone, dateFormat, timeFormat, now } = useRootLoaderData();
	const { language, t } = useTranslation();
	const isChinese = language === "zh-CN";
	const locale = isChinese ? language : requestLocale;
	const [currentNow, setCurrentNow] = useState(now);

	useEffect(() => {
		const nextNow = Date.now();
		// oxlint-disable-next-line react/set-state-in-effect -- Replace the SSR timestamp with the client clock only after hydration.
		setCurrentNow(nextNow === now ? now : nextNow);
	}, [now]);

	return useMemo(() => {
		const options = { locale, timeZone, dateFormat, timeFormat };
		const withNever =
			(formatter: (date: DateInput) => string) =>
			(date: DateInput): string =>
				date ? formatter(date) : t("time.never");

		return {
			formatDateTime: withNever((date) => rawFormatters.formatDateTime(date, options)),
			formatDateTimeWithSeconds: withNever((date) => rawFormatters.formatDateTimeWithSeconds(date, options)),
			formatDateWithMonth: withNever((date) => rawFormatters.formatDateWithMonth(date, options)),
			formatDate: withNever((date) => rawFormatters.formatDate(date, options)),
			formatShortDate: withNever((date) => rawFormatters.formatShortDate(date, options)),
			formatShortDateTime: withNever((date) => rawFormatters.formatShortDateTime(date, options)),
			formatTime: withNever((date) => rawFormatters.formatTime(date, options)),
			formatTimeAgo: withNever((date) =>
				rawFormatters.formatTimeAgo(date, currentNow, {
					locale: isChinese ? zhCN : undefined,
					justNowLabel: t("time.justNow"),
				}),
			),
		};
	}, [locale, timeZone, currentNow, dateFormat, timeFormat, isChinese, t]);
}
