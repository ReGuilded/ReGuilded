const { SettingsManager, ThemesManager } = require("./Managers");

module.exports = class ReGuilded {
    constructor() {
        this.settingsManager = new SettingsManager();
        this.themesManager = new ThemesManager();

        if (document.readyState === 'loading') {
            // Once DOM loads, initiate ReGuilded
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // If themes are enabled, load themes
        if (this.settingsManager.getValue("themes").useThemes) this.themesManager.loadThemes();
    }
    
    uninit() {
        this.themesManager.unloadThemes();
    }
};