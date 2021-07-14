const fs = require("fs");
const path = require("path");

/**
 * Manages different components of ReGuilded to allow them to be extended.
 */
module.exports = class ExtensionManager {
    /**
     * Manages different components of ReGuilded to allow them to be extended.
     * @param {String} dirname The path to the extension directory
     */
    constructor(dirname) {
        this.dirname = dirname;
    }
    /**
     * Checks if the identifier of the extension is correct or not.
     * @param {String} id The identifier of the extension
     * @returns Whether the identifier is correct or not
     */
    static checkId(id) {
        return (
            typeof id === "string" &&
            // Checks if it's empty
            id
                // Removes correct parts of the ID
                .replace(module.exports.idRegex, "").length === 0
        );
    }
    /**
     * Gets a list of extensions.
     * @param {String[]} enabled A list of enabled extensions
     * @returns A list of extension directories
     */
    getDirs(enabled = []) {
        // Create extensions array
        this.all = [];
        // Sets enabled extensions
        this.enabled = enabled;
        // Gets all files in extensions directory
        return fs.readdirSync(this.dirname, { withFileTypes: true }).filter((x) => x.isDirectory());
    }

    /**
     * Loads all ReGuilded extensions onto Guilded.
     */
    loadAll() {
        // Loads all found enabled extensions
        for (let ext of this.all)
            if (this.enabled.includes(ext.id))
                this.load(ext);
    }
    /**
     * Removes ReGuilded themes from Guilded.
     */
    unloadAll() {
        // Gets all enabled extensions
        // Unloads an extension
        for (let id of this.enabled) this.unload(id);
    }
    /**
     * Gets path of an extension.
     * @param {String} name The name of the extension to get path of
     * @returns {String} Extension path
     */
    getPath(name) {
        return path.join(this.dirname, name);
    }

    /**
     * Checks if property is given type and if it isn't, throws an error.
     * @param {String} name The name of the property.
     * @param {any} value The value of the property.
     * @param {String} type Expected type of the property.
     * @param {String} path Path to the JSON where property is.
     */
    static checkProperty(name, value, type, path) {
        if (typeof value !== type)
            throw new TypeError(`Expected '${name}' to be ${type}, found ${typeof value} instead in ${path}`);
    }
};
/**
 * A Regex pattern for determining whether given extension's ID is correct.
 */
module.exports.idRegex = /^[A-Za-z0-9]+$/g;
