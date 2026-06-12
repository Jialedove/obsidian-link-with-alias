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

	it("defines the same translation keys for every language", () => {
		const languages = Object.keys(I18N) as Language[];
		const referenceKeys = Object.keys(I18N.en).sort();

		languages.forEach((language) => {
			expect(Object.keys(I18N[language]).sort()).toEqual(referenceKeys);
		});
	});
});
