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
    addons: ReGuildedAddonSettings;
    themes: ReGuildedEnhancementSettings;
};
export type ReGuildedSettingsUpdate = {
    autoUpdate?: boolean;
    badge?: BadgeHandling;
    loadAuthors?: boolean;
    keepSplash?: boolean;
    addons?: ReGuildedEnhancementSettings;
    themes?: ReGuildedEnhancementSettings;
};
export type ReGuildedWhitelist = {
    all: Array<string>;
    connect: Array<string>;
    default: Array<string>;
    font: Array<string>;
    img: Array<string>;
    media: Array<string>;
    script: Array<string>;
    style: Array<string>;
};
export type ReGuildedState = {
    lastViewedChangelogVersion?: string;
};
export declare interface ReGuildedConfigCommon<T> {
    getConfig(): T;
    updateConfig(props: Partial<T>): Promise<void>;
}
export declare interface ReGuildedEnhancementSettings {
    enabled: string[];
}
export declare interface ReGuildedAddonSettings extends ReGuildedEnhancementSettings {
    permissions: { [addonId: string]: number };
}
