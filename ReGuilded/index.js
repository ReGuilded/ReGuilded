const { SettingsManager, ThemesManager } = require("./managers");

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

        // TODO: Fix check that's broken.
        // Checks if it's an array
        //if (!(enabledThemes instanceof Array)) throw new TypeError("Expected property themes.enabled to be an array in configuration")

        // If themes are enabled, load themes
        if (themeConfig.useThemes) this.themesManager.init(enabledThemes)
    }
    
    /**
     * Uninitiates ReGuilded
     */
    uninit() {
        this.themesManager.unloadThemes();
    }
};