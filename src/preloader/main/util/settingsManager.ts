import { ReGuildedSettings } from "../../../common/ReGuildedSettings";
import { writeFile } from "fs/promises";
import { join } from "path";

/**
 * Default ReGuilded settings.
 */
export const defaultSettings: ReGuildedSettings = {
  badge: 0,
  loadImages: true,
  autoUpdate: false,
  loadAuthors: true,
  keepSplash: false,
  themes: { enabled: [] },
  sounds: { enabled: [] },
  addons: { enabled: [], permissions: {} }
};

export class SettingsManager {
  directory: string;
  reguildedSettings: ReGuildedSettings;

  constructor(directory: string, reguildedSettings: ReGuildedSettings) {
    // Sets settings directory as `~/.reguilded/settings`
    this.directory = directory;

    // Fill in any settings that are not present
    this.reguildedSettings = Object.assign(defaultSettings, reguildedSettings);
  }

  /**
   * Saves current configuration of the settings.
   */
  async save(): Promise<void> {
    await writeFile(this.settingsFile, JSON.stringify(this.reguildedSettings), {
      encoding: "utf8"
    });
  }

  /**
   * Updates the configuration and saves it to settings file.
   * @param config The configuration properties to update with their updated values
   * @returns Configuration
   */
  updateSettings<T>(config: T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      Object.assign(this.reguildedSettings, config);
      // To save it to JSON and hand out the given properties
      this.save().then(
        () => resolve(config),
        (e) => reject(e)
      );
    });
  }

  /**
   * Gets the path to the main settings file.
   * @returns Settings file path
   */
  get settingsFile(): string {
    return join(this.directory, "settings.json");
  }
}
