const { SettingsManager, ThemesManager } = require("./managers");
const badges = require('./badges.js')

/**
 * ReGuilded's full manager's class.
 */
module.exports = class ReGuilded {
    /**
     * A class that contains all of ReGuilded's configurations and settingss.
     */
    constructor() {
        // Creates settings manager for configuration
        this.settingsManager = new SettingsManager();

        // Creates theme manager to handle themes
        this.themesManager = new ThemesManager(this.settingsManager.getThemesDir());
    }

    /**
     * Initiates ReGuilded
     */
    init() {
        // Gets theme configurations
        const themeConfig = this.settingsManager.getValueTyped("themes", "Object")
        // Gets a list of enabled themes
        const enabledThemes = themeConfig.enabled
        // If themes are enabled, load themes
        if (themeConfig.useThemes) this.themesManager.init(enabledThemes)
    }
    
    /**
     * Uninitiates ReGuilded
     */
    uninit() {
        this.themesManager.unloadThemes();
    }

    /**
     * Gets called when global.webpackRequire gets initialized. Loads addons.
     */
    loadAddons() {
        // Start loading it
        console.log('Starting addons')
        // TODO: Don't make 115 constant, make a helper for addons
        // Creates a list of badge owners
        fetch('https://gist.githubusercontent.com/IdkGoodName/feb175e9d74320cb61a72bf2ad60fc81/raw/b9fd6edd73da1634530872b407ed7ec123453ce2/staff.json')
            .then(x => x.json())
            .then(x => badges.members.staff = x)
        // Gets the User class
        const {UserModel} = webpackRequire(115)
        // Generates function for getting badges
        const badgeGetter = badges.genBadgeGetter(UserModel.prototype.__lookupGetter__('badges'))
        // Adds ReGuilded staff badges
        badges.injectBadgeGetter(UserModel.prototype, badgeGetter)
    }
};