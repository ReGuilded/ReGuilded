const { existsSync } = require("fs");
const { join } = require("path");

/**
 * A manager that manages ReGuilded's settings and configuration.
 */
module.exports = class SettingsManager {
    /**
     * A manager that manages ReGuilded's settings and configuration.
     */
    constructor() {
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
     * @returns Property's value
     */
    getValue(prop) {
        return this.config[prop]
    }
    /**
     * Gets configuration property if it exists and type is correct.
     * @param prop Property's name to get
     * @param type Type of the property to expect
     * @returns Property's value
     */
    getValueTyped(prop, type) {
        // Gets property's value
        const value = this.getValue(prop)
        // Check if it's instance of type or type of value is given type
        if(!(value instanceof type) && typeof value !== type) throw new TypeError(`Expected property '${prop}' to be instance of '${type}' in configuration`)
        // Returns the value of the property
        return value
    }
};