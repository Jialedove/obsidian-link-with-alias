import { App, DropdownComponent, PluginSettingTab, Setting, ToggleComponent } from "obsidian";
import { LANGUAGE_OPTIONS, Language, t } from "./i18n";
import { default as FrontmatterLinksPlugin, default as LinkWithAliasPlugin } from "./main";

export interface LinksSettings {
	language: Language;
	copyDisplayText: boolean;
	capitalizeFileName: boolean;
	preserveContext: boolean;
	freezeCompletionLinks: boolean;
	freezeRenamedPlainLinks: boolean;
	addOldTitleAliasOnRename: boolean;
	enableUserOverrideRegistry: boolean;
}

export const DEFAULT_SETTINGS: LinksSettings = {
	language: "en",
	copyDisplayText: true,
	capitalizeFileName: true,
	preserveContext: true,
	freezeCompletionLinks: true,
	freezeRenamedPlainLinks: true,
	addOldTitleAliasOnRename: true,
	enableUserOverrideRegistry: true,
};

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
			.setName(t(this.plugin.settings.language, "setting.copyDisplayText.name"))
			.setDesc(t(this.plugin.settings.language, "setting.copyDisplayText.desc"))
			.addToggle((component: ToggleComponent) => {
				component.setValue(this.plugin.settings.copyDisplayText);
				component.onChange((value: boolean) => {
					this.plugin.settings.copyDisplayText = value;
					this.plugin.saveSettings();
				});
			});
		new Setting(this.containerEl)
			.setName(t(this.plugin.settings.language, "setting.capitalizeFileName.name"))
			.setDesc(t(this.plugin.settings.language, "setting.capitalizeFileName.desc"))
			.setDisabled(!this.plugin.settings.copyDisplayText)
			.addToggle((component: ToggleComponent) => {
				component.setValue(this.plugin.settings.capitalizeFileName);
				component.onChange((value: boolean) => {
					this.plugin.settings.capitalizeFileName = value;
					this.plugin.saveSettings();
				});
			});
		new Setting(this.containerEl)
			.setName(t(this.plugin.settings.language, "setting.preserveContext.name"))
			.setDesc(t(this.plugin.settings.language, "setting.preserveContext.desc"))
			.addToggle((component: ToggleComponent) => {
				component.setValue(this.plugin.settings.preserveContext);
				component.onChange((value: boolean) => {
					this.plugin.settings.preserveContext = value;
					this.plugin.saveSettings();
					this.display();
				});
			});
		new Setting(this.containerEl)
			.setName(t(this.plugin.settings.language, "setting.freezeCompletionLinks.name"))
			.setDesc(t(this.plugin.settings.language, "setting.freezeCompletionLinks.desc"))
			.setDisabled(!this.plugin.settings.preserveContext)
			.addToggle((component: ToggleComponent) => {
				component.setValue(this.plugin.settings.freezeCompletionLinks);
				component.onChange((value: boolean) => {
					this.plugin.settings.freezeCompletionLinks = value;
					this.plugin.saveSettings();
				});
			});
		new Setting(this.containerEl)
			.setName(t(this.plugin.settings.language, "setting.freezeRenamedPlainLinks.name"))
			.setDesc(t(this.plugin.settings.language, "setting.freezeRenamedPlainLinks.desc"))
			.setDisabled(!this.plugin.settings.preserveContext)
			.addToggle((component: ToggleComponent) => {
				component.setValue(this.plugin.settings.freezeRenamedPlainLinks);
				component.onChange((value: boolean) => {
					this.plugin.settings.freezeRenamedPlainLinks = value;
					this.plugin.saveSettings();
				});
			});
		new Setting(this.containerEl)
			.setName(t(this.plugin.settings.language, "setting.addOldTitleAliasOnRename.name"))
			.setDesc(t(this.plugin.settings.language, "setting.addOldTitleAliasOnRename.desc"))
			.setDisabled(!this.plugin.settings.preserveContext)
			.addToggle((component: ToggleComponent) => {
				component.setValue(this.plugin.settings.addOldTitleAliasOnRename);
				component.onChange((value: boolean) => {
					this.plugin.settings.addOldTitleAliasOnRename = value;
					this.plugin.saveSettings();
				});
			});
		new Setting(this.containerEl)
			.setName(t(this.plugin.settings.language, "setting.enableUserOverrideRegistry.name"))
			.setDesc(t(this.plugin.settings.language, "setting.enableUserOverrideRegistry.desc"))
			.setDisabled(!this.plugin.settings.preserveContext)
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
