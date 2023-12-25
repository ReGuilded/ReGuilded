import { ReGuildedConfigCommon, ReGuildedSettings } from "../../common/ReGuildedSettings";
import ReGuilded from "../core/ReGuilded";

declare global {
  interface Window {
    // Exposed via Preload
    ReGuildedConfig: {
      isFirstLaunch: boolean;
      settings: ReGuildedConfigCommon<ReGuildedSettings>;
      // state: ReGuildedConfigCommon<ReGuildedState>;
      // addons: RGAddonConfig;
      // themes: RGThemeConfig;
      openItem(path: string): void;
      openExternal(path: string): void;
      checkForUpdate(): Promise<[boolean, { version: string; downloadUrl: string; sha256: string }]>;
      doUpdateIfPossible(): Promise<boolean>;
    };

    ReGuilded: ReGuilded;
  }
}

export {};
