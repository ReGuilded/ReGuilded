const EventEmitter = require("events");
const path = require("path");
const fs = require("fs");

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
     * @param {string} id The identifier of the extension
     * @param {string} path The path of the file
     * @returns Whether the identifier is correct or not
     */
    static checkId(id, path) {
        const isId = (
            typeof id === "string" &&
            // Checks if it's empty
            id.replace(module.exports.idRegex, "").length === 0
        );
        if (!isId)
            throw new Error(`Incorrect syntax of the property 'id'.`);
    }
    /**
     * Gets a list of extensions.
     * @param {String[]} enabled A list of enabled extensions
     * @returns A list of extension directories
     */
    getDirs(enabled = []) {
        this.all = [];
        this.enabled = enabled;

        return fs.readdirSync(this.dirname, { withFileTypes: true }).filter((x) => x.isDirectory());
    }
    /**
     * Checks whether all extensions were loaded and emits the event for them.
     * @param {number} index The current index of the iterator
     * @param {length} totalLength The total length of all extensions available
     */
    checkLoaded(index, totalLength) {
        // Ensure this is the last extension and that we haven't already tripped the event
        if (totalLength - 1 == index && !this.allLoaded) {
            // Trip the event
            this.allLoaded = true;
            this.emit("fullLoad", this.all);
        }
    }

    /**
     * Loads all ReGuilded extensions onto Guilded.
     */
    loadAll() {
        for (let ext of this.enabled) {
            const extension = this.all.find(x => x.id === ext);

            if(extension) this.load(extension);
        }
    }
    /**
     * Removes ReGuilded themes from Guilded.
     */
    unloadAll() {
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
     * @param {string} name The name of the property.
     * @param {any} value The value of the property.
     * @param {[string | function]} types Expected types of the property.
     * @param {string} path Path to the JSON where property is.
     */
    static checkProperty(name, value, types, path) {
        if (types.includes(typeof value) && types.some(x => x instanceof Function && value instanceof x))
            throw new TypeError(`Expected '${name}' to be ${type}, found ${typeof value} instead in ${path}`);
    }
};
/**
 * A Regex pattern for determining whether given extension's ID is correct.
 */
module.exports.idRegex = /^[A-Za-z0-9]+$/g;
