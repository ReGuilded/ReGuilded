/**
 * Manager that manages ReGuilded's themes
 */
module.exports = class ThemesManager {
    constructor() {
        this.using = []
        this.themesDir = global._Settings.getThemesDir();
    }

    /**
     * Initiates theme manager
     */
    init() {
        
    }

    // TODO: Complete Theme Loading/Unloading.

    /**
     * Loads ReGuilded themes onto Guilded.
     */
    loadThemes() {
        console.log("Loading Reguilded themes...");
    }
    
    /**
     * Removes ReGuilded themes from Guilded.
     */
    unloadThemes() {
        console.log("Unloading ReGuilded themes...");
    }
};