export declare enum BadgeHandling {
    None,
    Flair = 1,
    Badge = 2
}
export type ReGuildedSettings = {
    badge: BadgeHandling;
    loadAuthors: boolean;
    addons: ReGuildedExtensionSettings;
    themes: ReGuildedExtensionSettings;
};
export type ReGuildedSettingsUpdate = {
    badge?: BadgeHandling;
    loadAuthors?: boolean;
    addons?: ReGuildedExtensionSettings;
    themes?: ReGuildedExtensionSettings;
};
export type ReGuildedExtensionSettings = {
    enabled: string[];
};
