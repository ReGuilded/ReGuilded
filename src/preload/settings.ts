import {ReGuildedSettings, ReGuildedWhitelist} from "../common/reguilded-settings";
import { promises as fsPromises } from "fs";
const { writeFile, readFile } = fsPromises;
import { join } from "path";
import * as process from "process";
import {write} from "fs-extra";
import { ipcRenderer } from "electron";


/**
 * Default ReGuilded settings.
 */
export const defaultSettings: ReGuildedSettings = {
    autoUpdate: false,
    badge: 0,
    loadImages: true,
    loadAuthors: true,
    keepSplash: false,
    debugMode: false,
    addons: { enabled: [], permissions: {} },
    themes: { enabled: [] }
};

/**
 * Default ReGuilded Whitelist
 */
export const defaultWhitelist: ReGuildedWhitelist = {
    connectSrc: [],
    defaultSrc: [],
    fontSrc: [],
    imgSrc: [],
    mediaSrc: [],
    scriptSrc: [],
    styleSrc: []
}

/**
 * A manager that manages ReGuilded's settings and configuration.
 */
export default class SettingsManager {
    directory: string;
    settings: ReGuildedSettings;
    whitelist: ReGuildedWhitelist;
    /**
     * A manager that manages ReGuilded's settings and configuration.
     */
    constructor(directory: string, [settings, whitelist]: [ReGuildedSettings, ReGuildedWhitelist]) {
        // Sets settings directory as `~/.reguilded/settings`
        this.directory = directory;

        // Fill in any settings that are not present
        this.settings = Object.assign(defaultSettings, settings);
        this.whitelist = Object.assign(defaultWhitelist, whitelist);
    }

    /**
     * Saves current configuration of the settings.
     */
    async save(): Promise<void> {
        await writeFile(this.settingsFile, JSON.stringify(this.settings), {
            encoding: "utf8"
        });
    }

    /**
     * Saves current configuration of the whitelist.
     */
    async saveWhitelist(): Promise<void> {
        await writeFile(this.whitelistFile, JSON.stringify(this.whitelist, null, 4), {
           encoding: "utf8"
        });
        ipcRenderer.invoke("reguilded-repatch-csp", [await readFile(this.whitelistFile, {encoding:"utf-8"})]);
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
     * Gets the path to the main settings file.
     * @returns Settings file path
     */
    get settingsFile(): string {
        return join(this.directory, "settings.json");
    }

    /**
     * Gets the path to the whitelist file.
     * @returns whitelist file path
     */
    get whitelistFile(): string {
        return join(this.directory, "custom-csp-whitelist.json");
    }

    /**
     * Gets configuration property if it exists.
     * @param prop Property's name
     * @returns Property's value
     */
    getValue(prop: string): any {
        return this.settings[prop];
    }
}
