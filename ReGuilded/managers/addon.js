const ExtensionManager = require("./extension.js");
const { FileWatcher } = require("../utils");
const { join, parse } = require("path");
const { existsSync } = require("fs");
const copydir = require("../libs/copy-dir");

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
        console.log("Initiating add-on manager");
        // Gets a list of add-on directories
        const addons = super.getDirs(enabled);
        // Gets every add-on directory
        for (let i in addons) {
            const addon = addons[i]
            // Try-catch errors to prevent conflicts with other plugins
            try {
                console.log(`Found addon directory '${addon.name}'`);
                // Gets the path of the add-on
                const addonPath = super.getPath(addon.name);
                // Gets path of the main JS file
                const jsPath = join(addonPath, "main.js");
                // If it doesn't have main file, it's not an add-on and ignore it
                if(!existsSync(jsPath)) continue
                // Require the main file
                let main = require(jsPath);
                // Check for ESM default module
                if (typeof(main.preinit) !== "function" && main.default) main = main.default;
                
                // Check if the preinit function exists to prevent errors
                if (typeof(main.preinit) === "function") {
                    // Pre-initialize add-on
                    main.preinit(this.parent, this);
                    // Sets directory's name
                    main.dirname = addonPath;
                    // Setup watcher
                    main.watcher = new FileWatcher(addonPath, this.reload.bind(this), main.id);
                    // Push it to the list of add-ons
                    this.all.push(main);
                    // Emit add-on load event
                    this.emit("load", main);
                }
                else console.error("Add-on has no preinit function or has invalid formatting:", addon.id, '-', addon.name);
            }
            catch (e) {
                console.error("Failed to initialize add-on by ID", addon.id, e);
            }
            // Checks if it's the last item
            this.checkLoaded(i, addons.length);
        }
        // Loads all add-ons
        this.loadAll();
    }
    /**
     * Installs a ReGuilded add-on.
     * @param {{addonFromDir: String}} addonFromDir directory of add-on to install on Guilded
     */
    install(addonFromDir) {
        try {
            console.log('Installing addon from directory', addonFromDir);
            const addonDirName = parse(addonFromDir).base;
            const addonPath = join(this.parent.settingsManager.getAddonsDir(), addonDirName);
            // Copy add-on
            copydir.sync(addonFromDir, addonPath);
            // Require main file
            let installedAddon = require(join(addonPath, "main.js"));
            // Check for ESM default module
            if (typeof(installedAddon.preinit) !== "function" && installedAddon.default) installedAddon = installedAddon.default;
            // Check if the preinit function exists to prevent errors
            if (typeof(installedAddon.preinit) === "function") {
                // Pre-initialize add-on
                installedAddon.preinit(this.parent, this);
                // Sets directory's name
                installedAddon.dirname = addonPath;
                // Setup watcher
                installedAddon.watcher = new FileWatcher(addonPath, this.reload.bind(this), installedAddon.id);
                // Push it to the list of add-ons
                this.all.push(installedAddon);
                // Emit add-on load event
                this.emit("load", installedAddon);
                // Initialize addon-on
                installedAddon.init(this.parent, this, this.parent.webpackManager);
            }
            else console.error("Add-on has no preinit function or has invalid formatting:", addonFromDir);
        } catch(e) {
            console.error("Failed to install add-on from directory", addonFromDir, e);
        };
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
            
            const cachedModules = Object.keys(require.cache)
                                        .filter(moduleId => moduleId.match(new RegExp(`^${addon.dirname}`)));
            cachedModules.forEach(moduleId => delete require.cache[moduleId]);
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
            // Unitilize addon
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