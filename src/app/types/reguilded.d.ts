import React from "react";
import { Addon, AnyExtension, Theme } from "../../common/extensions";
import { ReGuildedSettings, ReGuildedSettingsUpdate } from "../../common/reguilded-settings";
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
            checkForUpdate(): Promise<[boolean, { version: string; downloadUrl: string; sha256: string }]>;
            doUpdateIfPossible(): Promise<void>;
        };
        // Client
        ReGuilded: ReGuilded;
        settingsInjector: SettingsInjector;
        getReactInstance: (element: Element | Node) => React.Component | void;
    }
}
export interface RGExtensionConfig<T extends AnyExtension> {
    dirname: string;
    getAll(): T[];
    getHasLoaded(): boolean;
    fetchImagesOf(extensionId: string, callback: (images: string[]) => void): void;
    openImportPrompt(): Promise<void>;
    delete(extensionId: string): Promise<void>;
    setLoadCallback(callback: (all: T[]) => void): void;
    setWatchCallback(callback: (extension: T, loaded: boolean, previousId: string) => void): void;
    setDeletionCallback(callback: (extension: T) => void): void;
}
export interface RGThemeConfig extends RGExtensionConfig<Theme> {
    setThemeSettings(themeId: string, settings: { [settingsProp: string]: string | number | boolean | undefined }): void;
}
export interface RGAddonConfig extends RGExtensionConfig<Addon> {}

export {};
