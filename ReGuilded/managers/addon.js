const ExtensionManager = require("./extension.js");
const { FileWatcher } = require("../utils");
const { join } = require("path");
const { existsSync } = require("fs");
const Module = require('module');

/**
 * Manager that manages ReGuilded's addons
 */
module.exports = class AddonManager extends ExtensionManager {
    /**
     * Manager that manages ReGuilded's addons
     * @param {String} addonsDir Path to the directory that holds addons
     * @param {ReGuilded} reGuilded Instance of ReGuilded that created this manager
     */
    constructor(addonsDir, reGuilded) {
        super(addonsDir);
        this.parent = reGuilded;
    }

    /**
     * Initiates addons for ReGuilded and addon manager
     * @param {String[]} enabled An array of enabled addons.
     */
    init(enabled = []) {
        console.log("Initiating addon manager");
        // Gets a list of addon directories
        const addons = super.getDirs(enabled);
        // Gets every theme directory
        for (let addon of addons) {
            console.log(`Found addon directory '${addon.name}'`);
            // Gets the path of the addon
            const addonPath = super.getPath(addon.name);
            // Gets path of the main JS file
            const jsPath = join(addonPath, "main.js");
            // If it doesn't have main file, it's not an addon and ignore it
            if(!existsSync(jsPath)) continue
            // Require the main file
            const main = require(jsPath);
            // Pre-initialize addon
            main.preinit(this.parent, this);
            // Sets directory's name
            main.dirname = jsPath;
            // Setup watcher
            main.watcher = new FileWatcher(jsPath, this.reload.bind(this), main.id);
            // Push it to the list of addons
            this.all.push(main);
        }
        // Loads all addons
        this.loadAll();
    }
    /**
     * Loads a ReGuilded addon.
     * @param {{id: String, name: String, init: Function, uninit: Function}} addon Addon to load onto Guilded
     */
    load(addon) {
        console.log(`Loading addon by ID '${addon.id}'`);
        addon.init(this.parent, this, this.parent.webpackManager);
    }
    /**
     * Unloads/removes a ReGuilded addon.
     * @param {{id: String, name: String, init: Function, uninit: Function}} addon Addon to load onto Guilded
     */
    unload(addon) {
        console.log(`Unloading addon by ID '${addon.id}'`);
        addon.uninit();
    }
    /**
     * Reloads a ReGuilded addon.
     * @param {{id: String, name: String, init: Function, uninit: Function}} addon Addon to load onto Guilded
     */
    reload(id) {
        console.log(`Reloading addon by ID '${id}'`);
        const addon = this.all.find(addon => addon.id === id);
        addon.uninit();
        delete require.cache[addon.dirname];
        const reloadedAddon = require(addon.dirname);
        reloadedAddon.preinit(this.parent, this);
        reloadedAddon.init(this.parent, this, this.parent.webpackManager);
    }
};
