import SettingsManager from "./settings";
import getSettingsFile from "./get-settings";
import { contextBridge } from "electron";
import { join } from "path";
import { ReGuildedSettings, ReGuildedSettingsUpdate } from "../common/reguilded-settings";

const settingsPath = join(__dirname, "./settings");

(async () => {
    const settingsManager = new SettingsManager(join(__dirname, "./settings"), await getSettingsFile(settingsPath));
    
    // Allow reconfiguration of settings
    contextBridge.exposeInMainWorld("ReGuildedConfig", {
        isFirstLaunch: window.isFirstLaunch,
        // Settings manager communication
        settings: {
            getSettings(): ReGuildedSettings {
                return settingsManager.settings;
            },
            /**
             * Updates the properties of the settings and saves them.
             * @param settingsProps Properties to update in the settings
             */
            async updateSettings(settingsProps: ReGuildedSettingsUpdate) {
                await settingsManager.updateSettings(settingsProps);
            }
        }
    });
});