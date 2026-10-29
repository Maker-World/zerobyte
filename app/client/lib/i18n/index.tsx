import { createContext, useContext, useMemo } from "react";
import { en, type Messages } from "./locales/en";
import { zhCN } from "./locales/zh-CN";

export const LANGUAGES = ["en", "zh-CN"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_COOKIE_NAME = "language";
export const DEFAULT_LANGUAGE: Language = "en";

export const languageLabels: Record<Language, string> = {
	en: "English",
	"zh-CN": "简体中文",
};

const dictionaries: Record<Language, Messages> = {
	en,
	"zh-CN": zhCN,
};

type Leaves<T, Prefix extends string = ""> = {
	[K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = Leaves<Messages>;
export type TranslationParams = Record<string, string | number>;
export type TFunction = (key: TranslationKey, params?: TranslationParams) => string;

export function isLanguage(value: unknown): value is Language {
	return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

export function resolveLanguage(locale?: string | null): Language {
	if (!locale) return DEFAULT_LANGUAGE;
	if (isLanguage(locale)) return locale;
	if (locale.toLowerCase().startsWith("zh")) return "zh-CN";
	return DEFAULT_LANGUAGE;
}

function lookup(dictionary: Messages, key: string): string | undefined {
	let current: unknown = dictionary;
	for (const part of key.split(".")) {
		if (current === null || typeof current !== "object") return undefined;
		current = (current as Record<string, unknown>)[part];
	}
	return typeof current === "string" ? current : undefined;
}

function interpolate(message: string, params?: TranslationParams) {
	if (!params) return message;
	return message.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

export function translate(language: Language, key: TranslationKey, params?: TranslationParams) {
	const message = lookup(dictionaries[language], key) ?? lookup(en, key) ?? key;
	return interpolate(message, params);
}

/**
 * Translates a key built at runtime (e.g. `status.${value}`), returning the fallback when no message exists
 */
export function translateDynamic(language: Language, key: string, fallback: string, params?: TranslationParams) {
	const message = lookup(dictionaries[language], key) ?? lookup(en, key) ?? fallback;
	return interpolate(message, params);
}

type I18nContextValue = {
	language: Language;
	setLanguage: (language: Language) => void;
	t: TFunction;
	tDynamic: (key: string, fallback: string, params?: TranslationParams) => string;
};

const createContextValue = (language: Language, setLanguage: (language: Language) => void): I18nContextValue => ({
	language,
	setLanguage,
	t: (key, params) => translate(language, key, params),
	tDynamic: (key, fallback, params) => translateDynamic(language, key, fallback, params),
});

// Falls back to English when rendered outside the provider (e.g. isolated component tests)
const I18nContext = createContext<I18nContextValue>(createContextValue(DEFAULT_LANGUAGE, () => {}));

export function I18nProvider({
	language,
	setLanguage,
	children,
}: {
	language: Language;
	setLanguage: (language: Language) => void;
	children: React.ReactNode;
}) {
	const value = useMemo(() => createContextValue(language, setLanguage), [language, setLanguage]);

	return <I18nContext value={value}>{children}</I18nContext>;
}

export function useTranslation() {
	return useContext(I18nContext);
}

/**
 * Renders a translated message. Useful where hooks can't be called directly, such as table column definitions
 */
export function Trans({ k, params }: { k: TranslationKey; params?: TranslationParams }) {
	const { t } = useTranslation();
	return t(k, params);
}
