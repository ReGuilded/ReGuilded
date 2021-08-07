const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

/**
 * Manages different components of ReGuilded to allow them to be extended.
 */
module.exports = class ExtensionManager extends EventEmitter {
    /**
     * Manages different components of ReGuilded to allow them to be extended.
     * @param {String} dirname The path to the extension directory
     */
    constructor(dirname) {
        super();
        this.dirname = dirname;
        this.allLoaded = false;
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
     * Checks whether all extensions were loaded and emits the event for them.
     * @param {number} index The current index of the iterator
     * @param {length} totalLength The total length of all extensions available
     */
    checkLoaded(index, totalLength) {
        if(totalLength - 1 == index) {
            console.log('All loaded', index, totalLength)
            this.allLoaded = true;
            this.emit("fullLoad", this.all);
        }
    }

    /**
     * Loads all ReGuilded extensions onto Guilded.
     */
    loadAll() {
        // Loads all found enabled extensions
        for (let ext of this.enabled) {
            const extension = this.all.find(x => x.id === ext);
            // Make sure it exists
            if(extension) this.load(extension);
        }
    }
    /**
     * Removes ReGuilded themes from Guilded.
     */
    unloadAll() {
        // Get all existing extensions
        const existing = this.all.map(x => x.id);
        // Unload all existing extensions
        for (let id of this.enabled)
            if(existing.contains(id))
                this.unload(id);
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
