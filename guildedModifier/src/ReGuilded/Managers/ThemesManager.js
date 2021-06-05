module.exports = class ThemesManager {
    constructor() {
        this.themesDir = global._Settings.getThemesDir();
    }

    // TODO: Complete Theme Loading/Unloading.
    loadThemes() {
        console.log("Loading Themes...");
    }
    
    unloadThemes() {
        console.log("Unloading Themes...");
    }
};