jest.mock(
	"obsidian",
	() => ({
		Notice: class {},
		Plugin: class {},
		PluginSettingTab: class {},
		Setting: class {},
	}),
	{ virtual: true },
);

import { DEFAULT_SETTINGS } from "../src/settings";
import { I18N, Language } from "../src/i18n";

describe("i18n settings", () => {
	it("defaults to English", () => {
		expect(DEFAULT_SETTINGS.language).toEqual("en");
	});

	it("keeps completed-link freezing off by default", () => {
		expect(DEFAULT_SETTINGS.freezeCompletionLinks).toBe(false);
	});

	it("does not expose a global preserve-context switch", () => {
		expect(Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, "preserveContext")).toBe(false);
		expect(Object.prototype.hasOwnProperty.call(I18N.en, "setting.preserveContext.name")).toBe(false);
	});

	it("does not expose legacy selected-text filename settings", () => {
		expect(Object.prototype.hasOwnProperty.call(I18N.en, "setting.copyDisplayText.name")).toBe(false);
		expect(Object.prototype.hasOwnProperty.call(I18N.en, "setting.capitalizeFileName.name")).toBe(false);
	});

	it("explains each switch with separate on and off examples", () => {
		const zh = I18N.zh as Record<string, string>;
		const switchKeys = [
			"setting.freezeCompletionLinks",
			"setting.freezeRenamedPlainLinks",
			"setting.addOldTitleAliasOnRename",
			"setting.enableUserOverrideRegistry",
		];
		for (const key of switchKeys) {
			expect(Object.prototype.hasOwnProperty.call(zh, `${key}.desc`)).toBe(true);
			expect(Object.prototype.hasOwnProperty.call(zh, `${key}.exampleOn`)).toBe(true);
			expect(Object.prototype.hasOwnProperty.call(zh, `${key}.exampleOff`)).toBe(true);
		}
		expect(zh["setting.freezeCompletionLinks.exampleOn"]).toContain("开启：");
		expect(zh["setting.freezeCompletionLinks.exampleOff"]).toContain("关闭：");
		expect(zh["setting.addOldTitleAliasOnRename.desc"]).toContain("alias");
		expect(zh["setting.enableUserOverrideRegistry.desc"]).toContain("手动取消冻结");
	});

	it("defines the same translation keys for every language", () => {
		const languages = Object.keys(I18N) as Language[];
		const referenceKeys = Object.keys(I18N.en).sort();

		languages.forEach((language) => {
			expect(Object.keys(I18N[language]).sort()).toEqual(referenceKeys);
		});
	});
});
