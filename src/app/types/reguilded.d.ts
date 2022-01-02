import { ReGuildedSettings, ReGuildedSettingsUpdate } from "../../common/reguilded-settings";
import AddonApi from "../addons/addonApi";
import ReGuilded from "../core/ReGuilded";
import SettingsInjector from "../core/settings/settings";

declare global {
    interface Window {
        // Exposed via preload
        ReGuildedConfig: {
            isFirstLaunch: boolean,
            settings: {
                getSettings(): ReGuildedSettings,
                updateSettings(settingsProps: ReGuildedSettingsUpdate): void
            }
        };
        // Client
        ReGuildedApi: AddonApi;
        ReGuilded: ReGuilded;
        settingsInjector: SettingsInjector;
    }
}

export {};