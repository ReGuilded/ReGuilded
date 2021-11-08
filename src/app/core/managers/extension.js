const chokidar = require("../../libs/chokidar");
const EventEmitter = require("events");
const path = require("path");
const fs = require("fs");


/**
 * Manages different components of ReGuilded to allow them to be extended.
 */
module.exports = class ExtensionManager extends EventEmitter {
    static allowedReadmeName = "readme.md";
    /**
     * A Regex pattern for determining whether given extension's ID is correct.
     */
    static idRegex = /^[A-Za-z0-9]+$/g;
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
        if (!(typeof id === "string" && id.match(ExtensionManager.idRegex)))
            throw new Error(`Incorrect syntax of the property 'id'. Path:`, path);
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
        if (totalLength == index && !this.allLoaded) {
            // Trip the event
            this.allLoaded = true;
            this.emit("fullLoad", this.all);
        }
    }
    addMetadataConfig(metadata, dirname) {
        fs.readdir(dirname, (err, files) => {
            if (err) throw err;

            // Add readme to metadata if one of the readme file names exist
            const readmeName = files.find(f => f.toLowerCase() === ExtensionManager.allowedReadmeName);
            if (readmeName) {
                fs.readFile(path.join(dirname, readmeName), { encoding: 'utf8' }, (e, d) => {
                    if (e) throw e;

                    metadata.readme = d;
                });
            }
        });
        // Make sure publisher is an ID
        if (metadata.publisher && typeof metadata.publisher !== "string" && metadata.publisher.length !== 8)
        {
            console.warn("Publisher must be an identifier of the user in Guilded, not their name or anything else");
            // To not cause errors and stuff
            metadata.publisher = undefined;
        }
    }
    /**
     * Watches the extension directory for any changes.
     * @param {(dirname: string, fp: string, metadata) => void} callback
     */
    watch(callback) {
        const available = fs.readdirSync(this.dirname, { withFileTypes: true }),
              // Split '/' and get its length, to get the name of the extension.
              // The length already gives us +1, so no need to do that.
              // That's a dumdum way of doing it, but eh.
              relativeIndex = this.dirname.split(path.sep).length;

        // Create a loaded dictionary, to replace the old index-based load checker,
        // along with unloading when hot reloading
        const loaded = {};
        // Create a de-bouncer dictionary, to prevent lag from multi-loading
        const deBouncers = {};

        // Watch the directory for any file changes
        chokidar.watch(this.dirname).on("all", (type, fp) => {
            const extName = fp.split(path.sep)[relativeIndex]

            // Initialize the de-bouncer

            // Make sure extName exists(this not being `settings/addons` or `settings/themes`
            // ) and it's currently not in the process of rebouncing
            if (extName && !deBouncers[extName])
                deBouncers[extName] = setTimeout(async () => {
                    const extPath = this.getPath(extName);

                    // Get the metadata.json file path, and if it doesn't exist, ignore it
                    const metadataPath = path.join(extPath, "metadata.json");
                    if (!fs.existsSync(metadataPath)) {
                        this.all.find(metadata => metadata.dirname === addonPath) !== undefined && this.all.splice(this.all.index(this.all.find(metadata => metadata.dirname === addonPath)), 1);
                        return;
                    }

                    // Require the metadata file.
                    const metadata = require(metadataPath);
                    metadata.dirname = extPath;

                    // Add Readme, etc.
                    this.addMetadataConfig(metadata, extPath);

                    await callback(extPath, loaded[extName], metadata)
                        .then(
                            metadata => loaded[extName] = metadata,
                            rejection => console.error("Error in " + metadata.id + ":\n", rejection)
                        )
                        .then(() => {
                            // Check if it's done loading all extensions and do stuff with it
                            this.checkLoaded(Object.keys(loaded).length, available.length);

                            // Remove debouncer from the set for further debouncing and updatings
                            delete deBouncers[extName];
                        })
                }, 250);
        });
    }

    /**
     * Loads all ReGuilded extensions onto Guilded.
     */
    loadAll() {
        for (let ext of this.enabled) {
            const extension = this.all.find(x => x.id === ext);

            if (extension) this.load(extension);
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
