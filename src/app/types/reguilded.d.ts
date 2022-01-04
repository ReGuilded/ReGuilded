import { Addon, AnyExtension, Theme } from "../../common/extensions";
import { ReGuildedSettings, ReGuildedSettingsUpdate } from "../../common/reguilded-settings";
import AddonApi from "../addons/addonApi";
import ReGuilded from "../core/ReGuilded";
import SettingsInjector from "../core/settings/settings";

declare global {
    interface Window {
        // Exposed via preload
        ReGuildedConfig: {
            isFirstLaunch: boolean;
            settings: {
                getSettings(): ReGuildedSettings;
                updateSettings(settingsProps: ReGuildedSettingsUpdate): Promise<void>;
            };
            addons: RGAddonConfig;
            themes: RGThemeConfig;
            openItem(path: string): void;
            openExternal(path: string): void;
        };
        // Client
        ReGuildedApi: AddonApi;
        ReGuilded: ReGuilded;
        settingsInjector: SettingsInjector;
    }
}
export interface RGExtensionConfig<T extends AnyExtension> {
    dirname: string;
    getAll(): T[];
    getHasLoaded(): boolean;
    delete(extensionId: string): Promise<void>;
    setLoadCallback(callback: (all: T[]) => void): void;
    setWatchCallback(callback: (extension: T, loaded: boolean) => void): void;
    setDeletionCallback(callback: (extension: T) => void): void;
}
export interface RGThemeConfig extends RGExtensionConfig<Theme> {
    getAllCss(): { [themeId: string]: string[] };
    setThemeSettings(
        themeId: string,
        settings: { [settingsProp: string]: string | number | boolean | undefined }
    ): void;
}
export interface RGAddonConfig extends RGExtensionConfig<Addon> {
    load(addonId: string): void;
    unload(addonId: string): void;
}

export {};
