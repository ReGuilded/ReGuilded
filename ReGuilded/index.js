const { SettingsManager, ThemesManager, AddonManager } = require("./managers");
const badges = require("./badges.js");

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
        // Creates addon manager to handle addons
        this.addonManager = new AddonManager(this.settingsManager.getAddonsDir(), this);
    }

    /**
     * Initiates ReGuilded
     * @param {Function} webpackRequire A function that gets Guilded modules.
     */
    init(webpackRequire) {
        // Adds Webpack stuff to addon manager
        this.addonManager.webpackRequire = webpackRequire
        this.addonManager.webpackModules = webpackRequire.c
        this.addonManager.webpackFunctions = webpackRequire.m
        // Gets theme configurations
        const themeConfig = this.settingsManager.getValueTyped("themes", "object"),
            addonConfig = this.settingsManager.getValueTyped("addons", "object");
        // Gets a list of enabled themes
        const enabledThemes = themeConfig.enabled,
            enabledAddons = addonConfig.enabled;
        // If themes are enabled, load themes
        if (enabledThemes.length !== 0) this.themesManager.init(enabledThemes);
        // Initiates addon manager
        this.addonManager.init(enabledAddons);
        console.log('Addon require', this.addonManager.webpackRequire)
    }

    /**
     * Uninitiates ReGuilded
     */
    uninit() {
        this.themesManager.unloadThemes();
    }

    // loadAddons(webpackRequire) {
    //     // TODO: Don't make 115 constant, make a helper for addons
    //     // Creates a list of badge owners
    //     // fetch('https://gist.githubusercontent.com/IdkGoodName/feb175e9d74320cb61a72bf2ad60fc81/raw/b9fd6edd73da1634530872b407ed7ec123453ce2/staff.json')
    //     //     .then(x => x.json())
    //     //     .then(x => badges.members.staff = x)
    //     // // Gets the User class
    //     // const {UserModel} = webpackRequire(115)
    //     // // Generates function for getting badges
    //     // const badgeGetter = badges.genBadgeGetter(UserModel.prototype.__lookupGetter__('badges'))
    //     // // Adds ReGuilded staff badges
    //     // badges.injectBadgeGetter(UserModel.prototype, badgeGetter)
    // }
};
