const initializeApi = require('../../addons/initializeApi.js');
const { join, dirname, basename } = require("path");
const ExtensionManager = require("./extension.js");
const chokidar = require("../../libs/chokidar");
const { existsSync } = require("fs");
const _module = require("module");
const path = require("path");

/**
 * Manager that manages ReGuilded's addons
 */
module.exports = class AddonManager extends ExtensionManager {
    /**
     * Manager that manages ReGuilded's addons
     * @param {String} addonsDir Path to the directory that holds addons
     */
    constructor(addonsDir) {
        super(addonsDir);
        this.preinitialized = [];
    }

    /**
     * Initiates addons for ReGuilded and addon manager
     * @param {String[]} enabled An array of enabled addons.
     */
    init(addonApi, enabled = []) {
        console.log("Initiating addon manager");

        // Initialize these here instead of getDirs()
        this.all = [];
        this.enabled = enabled;
        
        // Try-catch; this should never throw errors
        try {
            // Initialize these
            initializeApi(addonApi);
        } catch(e) {
            console.error("Failed to initialize the ReGuilded addon API!", e);
        }
        
        // Create a loaded dictionary, to replace the old index-based load checker,
        // along with unloading when hot reloading
        const loaded = {};
        // Create a de-bouncer dictionary, to prevent lag from multi-loading
        const deBouncers = {};

        // REVIEW: This is a mess
        // Watch the directory for any file changes
        chokidar.watch(this.dirname).on("all", (type, fp) => {
            if (fp.endsWith("settings.json") || fp.endsWith("data.json")) { return; }
            const dir = basename(dirname(fp));
            // Initialize the de-bouncer
            clearTimeout(deBouncers[dir]);
            deBouncers[dir] = setTimeout(() => {
                const addonPath = super.getPath(dir);

                // Get the metadata.json file path, and if it doesn't exist, ignore it
                const metadataPath = path.join(addonPath, "metadata.json");
                if (!existsSync(metadataPath)) {
                    this.all.find(metadata => metadata.dirname === addonPath) !== undefined && this.all.splice(this.all.index(this.all.find(metadata => metadata.dirname === addonPath)), 1);
                    return;
                }

                // Require the metadata file.
                const metadata = require(metadataPath);
                metadata.dirname = addonPath;

                // If the addon is already loaded, unload it
                loaded[dir] && this.unload(metadata);
                // If the addon is in the list of all loaded addons, remove it
                ~this.all.indexOf(metadata) && this.all.splice(this.all.indexOf(metadata), 1);

                
                const propFiles = Array.isArray(metadata.files)
                    ? (
                        console.warn("REGUILDED: An array of files for addons is unsupported. Defaulting to use the first item! [0]"),
                        metadata.files[0]
                    )
                    : metadata.files;

                metadata.files = propFiles;

                // Make sure publisher is an ID
                if (metadata.publisher && typeof metadata.publisher !== "string" && metadata.publisher.length !== 8)
                {
                    console.warn("Publisher must be an identifier of the user in Guilded, not their name or anything else");
                    // To not cause errors and stuff
                    metadata.publisher = undefined;
                }

                // Gets the propFiles[0] file path, and if it doesn't exist, ignore it
                const mainPath = join(dirname(fp), propFiles);
                if (!existsSync(mainPath)) return;
                
                // Compile the main.js file
                let main = require(mainPath);
                // To check if it's valid
                if (typeof(main.init) !== "function" && main.default) main = main.default;

                if (typeof(main.init) === "function") {
                    metadata.functions = main;
                    this.all.push(metadata);

                    if (this.enabled.includes(metadata.id)) {
                        // Load the addon.
                        this.load(metadata);

                        loaded[dir] = metadata;

                        // I... don't want to talk about this

                        // And I do.
                        this.checkLoaded(Object.keys(loaded).length, enabled.length);
                    }
                }
                else console.error("Addon has no pre-init function or has invalid formatting:", dir);
            }, 250);
        });
    }

    /**
     * Loads a ReGuilded addon.
     * @param {{id: String, name: String, functions: {init: Function, load: Function, unload: Function}}} metadata addon to load onto Guilded
     */
    load(metadata) {
        // Try-catch errors to prevent conflicts with other plugins
        try {
            console.log(`Loading addon by ID`, metadata.id);
            if (!this.preinitialized.includes(metadata.id)) {
                // TODO: Add-on sandboxing
                metadata.functions.init()
                this.preinitialized.push(metadata.id);
            }
            metadata.functions.load(this, this.webpack);
        }
        catch (e) {
            console.error("Failed to load addon by ID", metadata.id, e);
        }
    }

    /**
     * Unloads/removes a ReGuilded addon.
     * @param {{id: String, name: String, dirname: String, files: String functions: {init: Function, load: Function, unload: Function}}} metadata addon to load onto Guilded
     */
    unload(metadata) {
        try {
            console.log("Unloading addon by ID", metadata.id);
            metadata.functions.unload(this, this.webpack);

            // Remove the addon from the cache
            const filePath = path.join(metadata.dirname, metadata.files);
            delete require.cache[filePath];
        } catch (e) {
            console.error("Failed to unload an addon by ID", metadata.id, e);
        }
    }
};