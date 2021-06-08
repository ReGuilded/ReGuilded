const { existsSync } = require("fs");
const { join } = require("path");

/**
 * A manager that manages ReGuilded's settings and configuration.
 */
module.exports = class SettingsManager {
    constructor() {
        // Sets ReGuilded's settings to be global
        global._Settings = this;
        // Sets settings directory
        this._SettingsDirectory = join(__dirname, "../../../", "_Settings");
        // Checks if settings file directory exists
        if (!existsSync(this._SettingsDirectory))
            throw new Error(`Settings Directory not detected.\n${this._SettingsDirectory}`);
        // Set its configuration
        this.config = require(join(this._SettingsDirectory, "Config.json"));
    }
    /**
     * Gets a path to ReGuilded's theme directory.
     * @returns Theme directory path
     */
    getThemesDir() {
        return join(this._SettingsDirectory, "Themes");
    }
    /**
     * Gets configuration property if it exists.
     * @param prop Property's name
     * @returns Object
     */
    getValue(prop) {
        return this.config[prop]
    }
};