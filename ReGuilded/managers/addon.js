const { stat } = require("fs");
const ExtensionManager = require("./extension.js");

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
            const jsPath = path.join(addonPath, "main.js");
            // If it doesn't have main file, it's not an addon and ignore it
            stat(jsPath, (e, _) => {
                if(e) {
                    // If it doesn't exist ignore it
                    if(e.code === 'ENOENT') return;
                    // If there is other kind of an error, throw it
                    else throw e;
                }
                // Require the main file
                const main = require(jsPath);
                // Push it to the list of addons
                this.all.push(main);
            })
        }
    }
    /**
     * Loads a ReGuilded addon.
     * @param {{id: String, name: String, load: Function, unload: Function}} addon Addon to load onto Guilded
     */
    load(addon) {
        console.log(`Loading addon by ID '${addon.id}'`);
        addon.load(this.parent, this);
    }
    /**
     * Unloads/removes a ReGuilded addon.
     * @param {{id: String, name: String, load: Function, unload: Function}} addon Addon to load onto Guilded
     */
    unload(addon) {
        console.log(`Unloading addon by ID '${addon.id}'`);
        addon.unload();
    }
};
