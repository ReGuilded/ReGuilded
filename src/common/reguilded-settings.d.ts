export declare enum BadgeHandling {
    None,
    Flair = 1,
    Badge = 2
}
export type ReGuildedSettings = {
    autoUpdate: boolean;
    badge: BadgeHandling;
    loadAuthors: boolean;
    loadImages: boolean;
    keepSplash: boolean;
    debugMode: boolean;
    addons: ReGuildedAddonSettings;
    themes: ReGuildedExtensionSettings;
};
export type ReGuildedSettingsUpdate = {
    autoUpdate?: boolean;
    badge?: BadgeHandling;
    loadAuthors?: boolean;
    keepSplash?: boolean;
    debugMode?: boolean;
    addons?: ReGuildedExtensionSettings;
    themes?: ReGuildedExtensionSettings;
};
export type ReGuildedWhitelist = {
    connectSrc: Array<string>,
    defaultSrc: Array<string>,
    fontSrc: Array<string>,
    imgSrc: Array<string>,
    mediaSrc: Array<string>,
    scriptSrc: Array<string>,
    styleSrc: Array<string>
};
export interface ReGuildedExtensionSettings {
    enabled: string[];
}
export interface ReGuildedAddonSettings extends ReGuildedExtensionSettings {
    permissions: { [addonId: string]: number };
}
