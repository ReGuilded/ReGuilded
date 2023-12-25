export declare enum BadgeHandling {
  None,
  Flair,
  Badge
}

export interface ReGuildedEnhancementSettings {
  enabled: string[];
}

export interface ReGuildedAddonSettings extends ReGuildedEnhancementSettings {
  permissions: { [addonId: string]: number };
}

export type ReGuildedSettings = {
  autoUpdate: boolean;
  loadImages: boolean;
  keepSplash: boolean;
  loadAuthors: boolean;
  badge: BadgeHandling;
  addons: ReGuildedAddonSettings;
  themes: ReGuildedEnhancementSettings;
  sounds: ReGuildedEnhancementSettings;
};

export type ReGuildedSettingsUpdate = {
  autoUpdate?: boolean;
  loadImages?: boolean;
  keepSplash?: boolean;
  loadAuthors?: boolean;
  badge?: BadgeHandling;
  addons?: ReGuildedAddonSettings;
  themes?: ReGuildedEnhancementSettings;
  sounds?: ReGuildedEnhancementSettings;
};

export declare interface ReGuildedConfigCommon<T> {
  getConfig(): T;
  updateConfig(props: Partial<T>): Promise<void>;
}
