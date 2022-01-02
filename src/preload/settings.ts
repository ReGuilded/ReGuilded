import { readFileSync, promises as fsPromises } from "fs";
const { writeFile } = fsPromises;
import { join } from "path";
import { ReGuildedSettings } from "../common/reguilded-settings";

//export const badgeNames = ["None", "Flair", "Badge"];

/**
 * Default ReGuilded settings.
 */
export const defaultSettings: ReGuildedSettings = {
    badge: 2,
    loadAuthors: true,
    addons: { enabled: [] },
    themes: { enabled: [] }
};
/**
 * A manager that manages ReGuilded's settings and configuration.
 */
export default class SettingsManager {
    directory: string;
    settings: ReGuildedSettings;
    /**
     * A manager that manages ReGuilded's settings and configuration.
     */
    constructor(directory: string, settings: ReGuildedSettings) {
        // Sets settings directory as `~/.reguilded/settings`
        this.directory = directory;

        // Fill in any settings that are not present
        this.settings = Object.assign(defaultSettings, settings);
    }

    /**
     * Saves current configuration of the settings.
     */
    async save(): Promise<void> {
        await writeFile(this.settingsFile, JSON.stringify(this.settings), { encoding: "utf8" });
    }
    /**
     * Updates the configuration and saves it to settings file.
     * @param config The configuration properties to update with their updated values 
     * @returns Configuration
     */
    updateSettings<T extends Object>(config: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            Object.assign(this.settings, config);
            // To save it to JSON and hand out the given properties
            this.save().then(
                () => resolve(config),
                e => reject(e)
            );
        });  
    }
    /**
     * Gets the path to ReGuilded's theme directory.
     * @returns Theme directory path
     */
    get themesDir(): string {
        return join(this.directory, "themes");
    }
    /**
     * Gets the path to ReGuilded's addon directory.
     * @returns Addon directory path
     */
    get addonsDir(): string {
        return join(this.directory, "addons");
    }
    /**
     * Gets the path to the main settings file.
     * @returns Settings file path
     */
    get settingsFile(): string {
        return join(this.directory, "settings.json");
    }

    /**
     * Gets configuration property if it exists.
     * @param prop Property's name
     * @returns Property's value
     */
    getValue(prop: string): any {
        return this.settings[prop];
    }

    /**
     * Gets configuration property if it exists and type is correct.
     * @param prop Property's name to get
     * @param type Type of the property to expect
     * @returns Property's value
     */
    getValueTyped(prop: string, type: string | Function): any {
        const value = this.getValue(prop);

        // Check if it's instance of type or type of value is given type
        if ((typeof type === "string" && typeof value !== type) || (typeof type === 'function' && !(value instanceof type)))
            throw new TypeError(`Expected property '${prop}' to be instance of '${type}' in configuration`);

        return value;
    }
};