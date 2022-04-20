import { ReGuildedSettings, ReGuildedWhitelist } from "../../common/reguilded-settings";
import { promises as fsPromises } from "fs";
import ConfigManager from "./config";
const { writeFile } = fsPromises;
import { join } from "path";

/**
 * Default ReGuilded settings.
 */
export const defaultSettings: ReGuildedSettings = {
    autoUpdate: false,
    badge: 0,
    loadImages: true,
    loadAuthors: true,
    keepSplash: false,
    addons: { enabled: [], permissions: {} },
    themes: { enabled: [], enabledExtensions: {} }
};

/**
 * Default ReGuilded Whitelist
 */
export const defaultWhitelist: ReGuildedWhitelist = {
    all: [],
    connect: [],
    default: [],
    font: [],
    img: [],
    media: [],
    script: [],
    style: []
};

/**
 * A manager that manages ReGuilded's settings and configuration.
 */
export default class SettingsManager extends ConfigManager<ReGuildedSettings> {
    whitelist: ReGuildedWhitelist;
    /**
     * A manager that manages ReGuilded's settings and configuration.
     */
    constructor(directory: string, [settings, whitelist]: [ReGuildedSettings, ReGuildedWhitelist]) {
        super(directory, "settings.json", Object.assign({}, defaultSettings, settings));

        // Update config from previous versions
        if (!this.config.themes.enabledExtensions) this.config.themes.enabledExtensions = {};

        // Removes Src from whitelist entries if found
        for (const entry in whitelist) {
            if (entry.includes("Src")) {
                whitelist[entry.split("Src")[0]] = whitelist[entry];
                delete whitelist[entry];
            }
        }

        this.whitelist = Object.assign({}, defaultWhitelist, whitelist);
    }

    /**
     * Saves current configuration of the whitelist.
     */
    async saveWhitelist(): Promise<void> {
        await writeFile(this.whitelistFile, JSON.stringify(this.whitelist, null, 4), {
            encoding: "utf8"
        });
        //ipcRenderer.invoke("reguilded-repatch-csp", [await readFile(this.whitelistFile, {encoding:"utf-8"})]);
    }

    /**
     * Gets the path to the whitelist file.
     * @returns whitelist file path
     */
    get whitelistFile(): string {
        return join(this.directory, "custom-csp-whitelist.json");
    }
}
