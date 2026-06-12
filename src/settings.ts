import { App, DropdownComponent, PluginSettingTab, Setting, ToggleComponent } from "obsidian";
import { LANGUAGE_OPTIONS, Language, TranslationKey, t } from "./i18n";
import { default as FrontmatterLinksPlugin, default as LinkWithAliasPlugin } from "./main";

export interface LinksSettings {
	language: Language;
	copyDisplayText: boolean;
	capitalizeFileName: boolean;
	freezeCompletionLinks: boolean;
	freezeRenamedPlainLinks: boolean;
	addOldTitleAliasOnRename: boolean;
	enableUserOverrideRegistry: boolean;
}

export const DEFAULT_SETTINGS: LinksSettings = {
	language: "en",
	copyDisplayText: true,
	capitalizeFileName: true,
	freezeCompletionLinks: false,
	freezeRenamedPlainLinks: true,
	addOldTitleAliasOnRename: true,
	enableUserOverrideRegistry: true,
};

type SwitchSettingKey =
	| "setting.freezeCompletionLinks"
	| "setting.freezeRenamedPlainLinks"
	| "setting.addOldTitleAliasOnRename"
	| "setting.enableUserOverrideRegistry";

function buildSwitchDesc(language: Language, key: SwitchSettingKey): DocumentFragment {
	const fragment = document.createDocumentFragment();
	[`${key}.desc`, `${key}.exampleOn`, `${key}.exampleOff`].forEach((translationKey) => {
		const line = document.createElement("div");
		line.textContent = t(language, translationKey as TranslationKey);
		fragment.appendChild(line);
	});
	return fragment;
}

export class LinksSettingTab extends PluginSettingTab {
	private plugin: LinkWithAliasPlugin;

	constructor(app: App, plugin: FrontmatterLinksPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		this.containerEl.empty();
		new Setting(this.containerEl)
			.setName(t(this.plugin.settings.language, "setting.language.name"))
			.setDesc(t(this.plugin.settings.language, "setting.language.desc"))
			.addDropdown((component: DropdownComponent) => {
				Object.entries(LANGUAGE_OPTIONS).forEach(([value, label]) => {
					component.addOption(value, label);
				});
				component.setValue(this.plugin.settings.language);
				component.onChange((value: Language) => {
					this.plugin.settings.language = value;
					this.plugin.saveSettings();
					this.plugin.refreshLanguage();
					this.display();
				});
			});
		new Setting(this.containerEl)
			.setName(t(this.plugin.settings.language, "setting.freezeCompletionLinks.name"))
			.setDesc(buildSwitchDesc(this.plugin.settings.language, "setting.freezeCompletionLinks"))
			.addToggle((component: ToggleComponent) => {
				component.setValue(this.plugin.settings.freezeCompletionLinks);
				component.onChange((value: boolean) => {
					this.plugin.settings.freezeCompletionLinks = value;
					this.plugin.saveSettings();
				});
			});
		new Setting(this.containerEl)
			.setName(t(this.plugin.settings.language, "setting.freezeRenamedPlainLinks.name"))
			.setDesc(buildSwitchDesc(this.plugin.settings.language, "setting.freezeRenamedPlainLinks"))
			.addToggle((component: ToggleComponent) => {
				component.setValue(this.plugin.settings.freezeRenamedPlainLinks);
				component.onChange((value: boolean) => {
					this.plugin.settings.freezeRenamedPlainLinks = value;
					this.plugin.saveSettings();
				});
			});
		new Setting(this.containerEl)
			.setName(t(this.plugin.settings.language, "setting.addOldTitleAliasOnRename.name"))
			.setDesc(buildSwitchDesc(this.plugin.settings.language, "setting.addOldTitleAliasOnRename"))
			.addToggle((component: ToggleComponent) => {
				component.setValue(this.plugin.settings.addOldTitleAliasOnRename);
				component.onChange((value: boolean) => {
					this.plugin.settings.addOldTitleAliasOnRename = value;
					this.plugin.saveSettings();
				});
			});
		new Setting(this.containerEl)
			.setName(t(this.plugin.settings.language, "setting.enableUserOverrideRegistry.name"))
			.setDesc(buildSwitchDesc(this.plugin.settings.language, "setting.enableUserOverrideRegistry"))
			.addToggle((component: ToggleComponent) => {
				component.setValue(this.plugin.settings.enableUserOverrideRegistry);
				component.onChange((value: boolean) => {
					this.plugin.settings.enableUserOverrideRegistry = value;
					this.plugin.saveSettings();
				});
			});
	}

	hide() {
		this.containerEl.empty();
	}
}
