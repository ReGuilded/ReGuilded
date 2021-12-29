import AddonApi from "../addons/addonApi";
import ReGuilded from "../core/ReGuilded";
import SettingsInjector from "../core/settings/settings";

declare global {
    interface Window {
        firstLaunch: boolean;
        ReGuildedApi: AddonApi;
        ReGuilded: ReGuilded;
        settingsInjector: SettingsInjector;
    }
}

export {};