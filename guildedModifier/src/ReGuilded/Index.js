const { SettingsManager, ThemesManager } = require("./Managers");

module.exports = class ReGuilded {
    constructor() {
        this.initialized = false;

        this.settingsManager = new SettingsManager();
        this.themesManager = new ThemesManager();

        if (document.readyState == 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (this.settingsManager.getValue("themes").useThemes) this.themesManager.loadThemes();

        this.initialized = true;
    }
    
    uninit() {
        this.initialized = false;

        this.themesManager.unloadThemes();
    }
};