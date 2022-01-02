import {
    ReGuildedSettings,
    ReGuildedSettingsUpdate
} from "../../../common/reguilded-settings";

/**
 * The wrapping handler around `window.ReGuildedConfig` for easier changes tracking.
 */
export default class SettingsHandler {
    settings: ReGuildedSettings;
    constructor() {
        this.settings = window.ReGuildedConfig.settings.getSettings();
    }
    /**
     * Updates the settings and saves them in settings file.
     * @param settingsProps The properties to set
     */
    async updateSettings(settingsProps: ReGuildedSettingsUpdate): Promise<void> {
        this.settings = Object.assign(this.settings, settingsProps);
        await window.ReGuildedConfig.settings.updateSettings(settingsProps);
    }
    /**
     * Saves the current settings.
     */
    async save(): Promise<void> {
        await window.ReGuildedConfig.settings.updateSettings(this.settings);
    }
}
