const fs = require("fs")
const path = require("path")

/**
 * Manages different components of ReGuilded to allow them to be extended.
 */
module.exports = class ExtensionManager {
    /**
     * Manages different components of ReGuilded to allow them to be extended.
     * @param {String} dirname The path to the extension directory
     */
    constructor(dirname) {
        this.dirname = dirname
    }
    /**
     * Checks if the identifier of the extension is correct or not.
     * @param {String} id The identifier of the extension
     * @returns Whether the identifier is correct or not
     */
    static checkId(id) {
        return id
            // Removes correct parts of the ID
            .replaceAll(module.exports.idRegex, "")
            // Checks if it's empty
            .length === 0
    }
    /**
     * Gets a list of extensions.
     * @param {String[]} enabled A list of enabled extensions
     * @returns A list of extension directories
     */
    getDirs(enabled = []) {
        // Create extensions array
        this.all = []
        // Sets enabled extensions
        this.enabled = enabled
        // Gets all files in extensions directory
        return fs
            .readdirSync(this.dirname, { withFileTypes: true })
            .filter(x => x.isDirectory())
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
        for(let id of this.enabled)
            // Unloads an extension
            this.unload(id)
    }
    /**
     * Gets path of an extension.
     * @param {String} name The name of the extension to get path of
     * @returns Extension path
     */
    getPath(name) {
        return path.join(this.dirname, name)
    }
}
/**
 * A Regex pattern for determining whether given extension's ID is correct.
 */
module.exports.idRegex = /^[A-Za-z0-9]+$/g