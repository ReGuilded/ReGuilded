const ExtensionManager = require("./extensionManager.js")

/**
 * Manager that manages ReGuilded's addons
 */
module.exports = class AddonManager extends ExtensionManager {
    /**
     * Manager that manages ReGuilded's addons
     * @param {String} addonsDir Path to the directory that holds addons
     */
    constructor(addonsDir) {
        super(addonsDir)
    }

    /**
     * Initiates addons for ReGuilded and addon manager
     * @param {String[]} enabled An array of enabled addons.
     */
    init(enabled = []) {
        // Gets a list of addon directories
        const addons = super.getDirs(enabled)
        // Gets every theme directory
        for(let addon of addons) {
            console.log(`Found addon directory '${addon.name}'`)
        }
    }
    /**
     * Loads a ReGuilded addon.
     * @param {{id: String, name: String, dirname: String, js: String}} addon Addon to load onto Guilded
     */
    load(addon) {
        // STUB
        // TODO(?): Perhaps make Extension class that will be for themes and addons?
    }
    /**
     * Unloads/removes a ReGuilded addon.
     * @param {{id: String, name: String, dirname: String, js: String}} addon Addon to load onto Guilded
     */
    unload(addon) {
        // STUB
    }
}