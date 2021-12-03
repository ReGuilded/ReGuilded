import chokidar from "../../libs/chokidar";
import EventEmitter from "events";
import path from "path";
import fs from "fs";


export class Extension<T> {
    public id: string;
    public files: T;
    public dirname: string;

    public author?: string;
    public contributors?: string[];
    public readme?: string;
}
/**
 * Manages different components of ReGuilded to allow them to be extended.
 */
export default abstract class ExtensionManager<T extends Extension<string | string[]>> extends EventEmitter {
    static allowedReadmeName: string = "readme.md";
    /**
     * A Regex pattern for determining whether given extension's ID is correct.
     */
    static idRegex: RegExp = /^[A-Za-z0-9]+$/g;

    dirname: string;
    allLoaded: boolean;
    all?: T[];
    enabled?: string[];
    /**
     * Manages different components of ReGuilded to allow them to be extended.
     * @param dirname The path to the extension directory
     */
    constructor(dirname: string) {
        super();
        this.dirname = dirname;
        this.allLoaded = false;
    }
    /**
     * Checks if the identifier of the extension is correct or not.
     * @param id The identifier of the extension
     * @param path The path of the file
     * @throws {Error} Incorrect parameter `id` syntax
     * @returns Checks identifier's syntax
     */
    static checkId(id: any, path: string): void {
        if (!(typeof id === "string" && id.match(ExtensionManager.idRegex)))
            throw new Error(`Incorrect syntax of the property 'id'. Path: ${path}`);
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
        // Make sure author is an ID
        if (metadata.author && typeof metadata.author !== "string" && metadata.author.length !== 8)
        {
            console.warn("Author must be an identifier of the user in Guilded, not their name or anything else");
            // To not cause errors and stuff
            metadata.author = undefined;
        }
    }
    /**
     * Watches the extension directory for any changes.
     * @param callback The callback when change occurs.
     */
    watch(callback: (dirname: string, fp: string, metadata) => Promise<Extension<string | string[]>>): void {
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
            const extName = fp.split(path.sep)[relativeIndex];

            // Make sure extName exists(this not being `settings/addons` or `settings/themes`
            // ) and it's currently not in the process of rebouncing
            if (extName && !deBouncers[extName])
                deBouncers[extName] = setTimeout(async () => {
                    const extPath = this.getPath(extName);

                    // Get the metadata.json file path, and if it doesn't exist, ignore it
                    const metadataPath = path.join(extPath, "metadata.json");
                    if (!fs.existsSync(metadataPath)) {
                        const existingExt =  this.all.find(metadata => metadata.dirname === extPath)
                        if (existingExt !== undefined) {
                            this.all.splice(this.all.indexOf(existingExt), 1);
                            this.unload(existingExt, true);
                            delete loaded[extName]
                        }
                        delete deBouncers[extName];
                        return;
                    }

                    let metadata = this.all.find(metadata => metadata.dirname === extPath);
                    // Require the metadata file.
                    if (metadata === undefined) {
                        metadata = require(metadataPath);
                        metadata.dirname = extPath;
                    }

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
    abstract load(extension: T): void;
    /**
     * Removes ReGuilded themes from Guilded.
     */
    unloadAll() {
        // Unload all existing extensions
        for (let ext of this.all)
        {
            if(~this.enabled.indexOf(ext.id))
                this.unload(ext);
        }
    }
    abstract unload(extensionId: T, hardUnload?: boolean): void;
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
            throw new TypeError(`Expected '${name}' to be [${types.join(", ")}], found ${typeof value} instead in ${path}`);
    }
};
