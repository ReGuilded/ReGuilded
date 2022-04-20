import React from "react";
import { Addon, AnyEnhancement, Theme } from "../../common/enhancements";
import { ReGuildedConfigCommon, ReGuildedSettings, ReGuildedState } from "../../common/reguilded-settings";
import ReGuilded from "../core/ReGuilded";
import SettingsInjector from "../core/settings/settings";

declare global {
    interface Window {
        // Exposed via preload
        ReGuildedConfig: {
            isFirstLaunch: boolean;
            settings: ReGuildedConfigCommon<ReGuildedSettings>;
            state: ReGuildedConfigCommon<ReGuildedState>;
            addons: RGAddonConfig;
            themes: RGThemeConfig;
            openItem(path: string): void;
            openExternal(path: string): void;
            checkForUpdate(): Promise<[boolean, { version: string; downloadUrl: string; sha256: string }]>;
            doUpdateIfPossible(): Promise<boolean>;
        };
        // Client
        ReGuilded: ReGuilded;
        settingsInjector: SettingsInjector;
        getReactInstance: (element: Element | Node) => React.Component | void;
    }
}
export interface RGEnhancementConfig<T extends AnyEnhancement> {
    dirname: string;
    getAll(): T[];
    getHasLoaded(): boolean;
    fetchImagesOf(enhancementId: string, callback: (images: string[]) => void): void;
    openImportPrompt(): Promise<void>;
    delete(enhancementId: string): Promise<void>;
    setLoadCallback(callback: (all: T[]) => void): void;
    setWatchCallback(callback: (enhancement: T, loaded: boolean, previousId: string) => void): void;
    setDeletionCallback(callback: (enhancement: T) => void): void;
}
export interface RGThemeConfig extends RGEnhancementConfig<Theme> {
    setThemeSettings(themeId: string, settings: { [settingsProp: string]: string | number | boolean | undefined }): void;
}
export interface RGAddonConfig extends RGEnhancementConfig<Addon> {}

export {};
