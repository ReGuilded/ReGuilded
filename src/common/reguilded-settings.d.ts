export declare enum BadgeHandling {
    None,
    Flair = 1,
    Badge = 2
}
export type ReGuildedSettings = {
    badge: BadgeHandling,
    loadAuthors: boolean,
    addons: { enabled: [] },
    themes: { enabled: [] }
};
export type ReGuildedSettingsUpdate = {
    badge?: BadgeHandling,
    loadAuthors?: boolean,
    addons: { enabled: [] },
    themes: { enabled: [] }
};