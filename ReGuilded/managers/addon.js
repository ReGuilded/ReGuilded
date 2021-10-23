const addonPreInit = require("../addons/addonPreinit.js");
const { join, dirname, basename } = require("path");
const ExtensionManager = require("./extension.js");
const chokidar = require("../libs/chokidar");
const { existsSync } = require("fs");
const _module = require("module");

/**
 * Manager that manages ReGuilded's add-ons
 */
module.exports = class AddonManager extends ExtensionManager {
    /**
     * Manager that manages ReGuilded's add-ons
     * @param {String} addonsDir Path to the directory that holds add-ons
     * @param {ReGuilded} reGuilded Instance of ReGuilded that created this manager
     */
    constructor(addonsDir, reGuilded) {
        super(addonsDir);
        this.parent = reGuilded;
    }

    /**
     * Initiates addons for ReGuilded and add-on manager
     * @param {String[]} enabled An array of enabled add-ons.
     */
    init(enabled = []) {
        // Initialize these here instead of getDirs()
        this.all = [];
        this.enabled = enabled;
        
        // Try-catch; this should never throw errors
        try {
            // Initialize these
            addonPreInit(this.parent.addonApi);
        }
        catch(e) {
            console.error("Failed to initialize the ReGuilded addon API!", e);
        }
        
        // Create a loaded dictionary, to replace the old index-based load checker,
        // along with unloading when hot reloading
        const loaded = {};
        // Create a de-bouncer dictionary, to prevent lag from multi-loading
        const deBouncers = {};
        // Watch the directory for any file changes
        chokidar.watch(this.dirname).on("all", (type, fp) => {
            const dir = basename(dirname(fp));
            // Initialize the de-bouncer
            clearTimeout(deBouncers[dir]);
            deBouncers[dir] = setTimeout(() => {
                // If the addon is already loaded, unload it
                loaded[dir] && this.unload(loaded[dir]);
                // If the addon is in the list of all loaded addons, remove it
                ~this.all.indexOf(loaded[dir]) && this.all.splice(this.all.indexOf(loaded[dir]), 1);

                // Get the main.js file path, and if it doesn't exist, ignore it
                const mainPath = join(dirname(fp), "main.js");
                if (!existsSync(mainPath)) return;
                
                // Compile the main.js file
                let main = require(mainPath);
                // To check if it's valid
                if (typeof(main.preinit) !== "function" && main.default) main = main.default;

                if (typeof(main.preinit) === "function") {
                    main.preinit(this.parent, this);
                    // For later re-use
                    main.dirname = dirname(fp);

                    this.all.push(main);
                    
                    // Emit the load event
                    this.emit("load", main);

                    // We're loaded; prevent stacking
                    loaded[dir] = main;

                    // I... don't want to talk about this
                    this.checkLoaded(Object.keys(loaded).filter(dir => ~enabled.indexOf(dir)).length - 1, enabled.length);
                }
                else console.error("Add-on has no pre-init function or has invalid formatting:", dir);
            }, 250);
        });
    }
    /**
     * Loads a ReGuilded add-on.
     * @param {{id: String, name: String, init: Function, uninit: Function}} addon add-on to load onto Guilded
     */
    load(addon) {
        // Try-catch errors to prevent conflicts with other plugins
        try {
            console.log(`Loading addon by ID`, addon.id);
            addon.init(this.parent, this, this.parent.webpackManager);
        }
        catch (e) {
            console.error("Failed to load add-on by ID", addon.id, e);
        }
    }
    /**
     * Unloads/removes a ReGuilded add-on.
     * @param {{id: String, name: String, init: Function, uninit: Function}} addon add-on to load onto Guilded
     */
    unload(addon) {
        try {
            console.log("Unloading add-on by ID", addon.id);
            addon.uninit();

            // Remove the addon from the cache
            const cache = Object.keys(_module._cache).filter(fp => ~fp.indexOf(addon.id));
            cache.forEach(entry => delete _module._cache[entry]);
        }
        catch (e) {
            console.error("Failed to unload an add-on by ID", addon.id, e);
        }
    }
    /**
     * Reloads a ReGuilded add-on.
     * @param {{id: String}} id id of add-on to reload on Guilded
     */
    reload(id) {
        let addon = this.all.find(addon => addon.id === id);
        if (!addon) addon = { name: `Invalid Add-on (${id})`, invalid: true };
        
        try {
            if(addon.invalid) throw new Error("Not installed or loaded");
            console.log("Reloading add-on by ID", id);
            // Uninitialize addon
            addon.uninit();

            const cachedModules = Object.keys(require.cache)
                                        .filter(moduleId => moduleId.match(new RegExp(`^${addon.dirname}`)));
            cachedModules.forEach(moduleId => delete require.cache[moduleId]);
            // Require main file
            let reloadedAddon = require(join(addon.dirname, "main.js"));
            // Check for ESM default module
            if (typeof(reloadedAddon.preinit) !== "function" && reloadedAddon.default) reloadedAddon = reloadedAddon.default;
            // Check if the preinit function still exists to prevent errors
            if (typeof(reloadedAddon.preinit) === "function") {
                // Pre-initialize add-on
                reloadedAddon.preinit(this.parent, this);
                // Initialize add-on
                reloadedAddon.init(this.parent, this, this.parent.webpackManager);
            }
            else console.error("Add-on has no preinit function or is formatted invalidly!", addon.name);
        } catch(e) {
            console.error("Add-on failed to reload!", addon.name, e);
        }
    }
};