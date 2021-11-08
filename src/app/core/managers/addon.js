const initializeApi = require('../../addons/initializeApi.js');
const { join, dirname, basename } = require("path");
const ExtensionManager = require("./extension.js");
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
        this.initialized = [];
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

        this.watch((addonPath, loaded, metadata) => new Promise((resolve, reject) => {
            // After that spaghetti junky code, get some properties of it
            const isEnabled = ~this.enabled.indexOf(metadata.id);
            metadata.dirname = addonPath;

            // If the addon is already loaded, unload it
            loaded && this.unload(metadata);
            // If the addon is in the list of all loaded addons, remove it
            if (~this.all.indexOf(metadata))
                this.all.splice(this.all.indexOf(metadata), 1);

            const propFiles = Array.isArray(metadata.files)
                ? (
                    console.warn("REGUILDED: An array of files for addons is unsupported. Defaulting to use the first item! [0]"),
                    metadata.files[0]
                )
                : metadata.files;

            metadata.files = propFiles;

            if (isEnabled) {
                // Load the addon.
                this.load(metadata);

                resolve(metadata);
            }
        }));
    }
    
    /**
     * Loads a ReGuilded addon.
     * @param {{id: String, name: String, functions: {init: Function, load: Function, unload: Function}}} metadata addon to load onto Guilded
     */
    load(metadata) {
        // Try-catch errors to prevent conflicts with other plugins
        try {
            console.log(`Loading addon by ID`, metadata.id);

            // Check if it's first time loading
            if (!~this.initialized.indexOf(metadata.id))
                this.initializeAddon(metadata);

            metadata.core.load(this, this.webpack);
        } catch (e) {
            console.error("Failed to load addon by ID", metadata.id, e);
        }
    }
    initializeAddon(metadata) {
        // Gets the propFiles[0] file path, and if it doesn't exist, ignore it
        const mainPath = join(metadata.dirname, metadata.files);

        if (!existsSync(mainPath))
            throw new Error("Missing main file");

        // Get the main file
        let main = require(mainPath);

        // To check if it's valid
        if (typeof(main.init) !== "function" && main.default) main = main.default;

        if (typeof(main.init) === "function") {
            metadata.core = main;
            this.all.push(metadata);
        }
        else console.error("Addon has no pre-init function or has invalid formatting:", dir);

        // TODO: Add-on sandboxing
        metadata.core.init();
        this.initialized.push(metadata.id);
    }

    /**
     * Unloads/removes a ReGuilded addon.
     * @param {{id: String, name: String, dirname: String, files: String functions: {init: Function, load: Function, unload: Function}}} metadata addon to load onto Guilded
     */
    unload(metadata) {
        try {
            console.log("Unloading addon by ID", metadata.id);
            metadata.core.unload(this, this.webpack);

            // Remove the addon from the cache
            const filePath = path.join(metadata.dirname, metadata.files);
            delete require.cache[filePath];
        } catch (e) {
            console.error("Failed to unload an addon by ID", metadata.id, e);
        }
    }
};