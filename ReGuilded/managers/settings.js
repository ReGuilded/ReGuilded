const { join } = require("path");

/**
 * A manager that manages ReGuilded's settings and configuration.
 */
module.exports = class SettingsManager {
    /**
     * A manager that manages ReGuilded's settings and configuration.
     */
    constructor() {
        // Sets settings directory as `~/.reguilded/settings`
        this.directory = join(__dirname, "../../settings");
        // Set its configuration
        this.config = require(join(this.directory, "settings.json"));
    }

    /**
     * Gets a path to ReGuilded's theme directory.
     * @returns Theme directory path
     */
    getThemesDir() {
        return join(this.directory, "themes");
    }
    /**
     * Gets a path to ReGuilded's addon directory.
     * @returns Addon directory path
     */
    getAddonsDir() {
        return join(this.directory, "addons");
    }

    /**
     * Gets configuration property if it exists.
     * @param prop Property's name
     * @returns Property's value
     */
    getValue(prop) {
        return this.config[prop];
    }

    /**
     * Gets configuration property if it exists and type is correct.
     * @param prop Property's name to get
     * @param type Type of the property to expect
     * @returns Property's value
     */
    getValueTyped(prop, type) {
        // Gets property's value
        const value = this.getValue(prop);
        // Check if it's instance of type or type of value is given type
        if ((typeof type === "string" && typeof value !== type) || (typeof type === 'function' && !(value instanceof type)))
            throw new TypeError(`Expected property '${prop}' to be instance of '${type}' in configuration`);
        // Returns the value of the property
        return value;
    }
};
