import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { I18nProvider, resolveLanguage, translate, translateDynamic, Trans } from "../i18n";
import { en } from "../i18n/locales/en";
import { zhCN } from "../i18n/locales/zh-CN";

const collectMessages = (messages: object, prefix = ""): [string, string][] =>
	Object.entries(messages).flatMap(([key, value]) =>
		typeof value === "string" ? [[`${prefix}${key}`, value]] : collectMessages(value as object, `${prefix}${key}.`),
	);

const placeholders = (message: string) => [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe("resolveLanguage", () => {
	test.each([
		[undefined, "en"],
		["en-US", "en"],
		["fr-FR", "en"],
		["zh", "zh-CN"],
		["zh-CN", "zh-CN"],
		["zh-Hant-TW", "zh-CN"],
	])("resolves %s to %s", (locale, expected) => {
		expect(resolveLanguage(locale)).toBe(expected);
	});
});

describe("translate", () => {
	test("returns the message for the requested language", () => {
		expect(translate("en", "nav.settings")).toBe("Settings");
		expect(translate("zh-CN", "nav.settings")).toBe("设置");
	});

	test("interpolates parameters and renders nullish values as empty strings", () => {
		expect(translate("en", "sidebar.runningVersion", { version: "v1.2.3" })).toBe("You're running v1.2.3.");
		expect(translate("en", "sidebar.versionAvailable", { version: null })).toBe(" available");
	});

	test("leaves unknown placeholders untouched", () => {
		expect(translate("en", "sidebar.runningVersion")).toBe("You're running {version}.");
	});

	test("falls back for runtime keys that do not exist", () => {
		expect(translateDynamic("zh-CN", "status.healthy", "healthy")).toBe("健康");
		expect(translateDynamic("zh-CN", "status.something-new", "something-new")).toBe("something-new");
	});
});

describe("Trans", () => {
	test("renders English without a provider", () => {
		render(<Trans k="nav.sources" />);
		expect(screen.getByText("Sources")).toBeTruthy();
	});

	test("renders the provider language", () => {
		render(
			<I18nProvider language="zh-CN" setLanguage={() => {}}>
				<Trans k="nav.sources" />
			</I18nProvider>,
		);
		expect(screen.getByText("数据源")).toBeTruthy();
	});
});

describe("locales", () => {
	const chineseMessages = new Map(collectMessages(zhCN));

	test.each(collectMessages(en))("%s keeps the same placeholders in Chinese", (key, message) => {
		expect(placeholders(chineseMessages.get(key) ?? "")).toEqual(placeholders(message));
	});
});
