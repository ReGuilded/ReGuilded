import { join } from "path";
import { readFileSync } from "fs";
/**
 * A manager that manages ReGuilded's settings and configuration.
 */
export default class SettingsManager {
    directory: string;
    config: {
        addons: {
            enabled: string[]
        },
        themes: {
            enabled: string[]
        }
    };
    /**
     * A manager that manages ReGuilded's settings and configuration.
     */
    constructor() {
        // Sets settings directory as `~/.reguilded/settings`
        this.directory = join(__dirname, "./settings");

        this.config = JSON.parse(readFileSync(join(this.directory, "settings.json"), { encoding: "utf8" }));
    }

    /**
     * Gets a path to ReGuilded's theme directory.
     * @returns Theme directory path
     */
    getThemesDir(): string {
        return join(this.directory, "themes");
    }
    /**
     * Gets a path to ReGuilded's addon directory.
     * @returns Addon directory path
     */
    getAddonsDir(): string {
        return join(this.directory, "addons");
    }

    /**
     * Gets configuration property if it exists.
     * @param prop Property's name
     * @returns Property's value
     */
    getValue(prop: string): any {
        return this.config[prop];
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
