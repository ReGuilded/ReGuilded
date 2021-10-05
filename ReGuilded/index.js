const { SettingsManager, ThemesManager, AddonManager, WebpackManager } = require("./managers");
const { readFileSync } = require("fs");
const badges = require('./badges.js');
const { join } = require("path");

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

        this.themesManager = new ThemesManager(this.settingsManager.getThemesDir());
        this.addonManager = new AddonManager(this.settingsManager.getAddonsDir(), this);
    }

    /**
     * Initiates ReGuilded
     * @param {Function} webpackRequire A function that gets Guilded modules.
     */
    init(webpackRequire) {
        if (global.firstLaunch) {
            const welcomeModalStyleElement = Object.assign(document.createElement("style"), {
                id: "rgWelcomeModal-style",
                innerHTML: readFileSync(join(__dirname, "assets/welcomeModal.css")).toString()
            });
            document.body.appendChild(welcomeModalStyleElement);

            const welcomeModalDivElement = Object.assign(document.createElement("div"), {
                classList: ["ReGuildedWelcomeModal"],
                id: "rgWelcomeModal",
                innerHTML: readFileSync(join(__dirname, "assets/welcomeModal.html")).toString()
            })
            document.body.appendChild(welcomeModalDivElement);

            function destroyIt() {
                welcomeModalDivElement.classList.add("Despawning");
                setTimeout(() => {
                    welcomeModalDivElement.remove();
                    welcomeModalStyleElement.remove();
                }, 200);
            }

            const welcomeModalCloseElement = document.getElementById("rgWelcomeModalClose");
            welcomeModalDivElement.addEventListener("click", destroyIt);
            welcomeModalCloseElement.addEventListener("click", destroyIt);
        }

        // Adds Webpack stuff to addon manager
        this.addonManager.webpackRequire = webpackRequire;
        this.addonManager.webpackModules = webpackRequire.c;
        this.addonManager.webpackFunctions = webpackRequire.m;

        const themeConfig = this.settingsManager.getValueTyped("themes", "object"),
            addonConfig = this.settingsManager.getValueTyped("addons", "object");

        const enabledThemes = themeConfig.enabled,
            enabledAddons = addonConfig.enabled;

        // Whether it should be initialized
        this.webpackManager = new WebpackManager(webpackRequire);
        
        this.loadBadges(this.webpackManager.userModel?.UserModel);
        
        this.themesManager.init(enabledThemes);
        this.addonManager.init(enabledAddons);
    }

    /**
     * Uninitiates ReGuilded
     */
    uninit() {
        this.themesManager.unloadThemes();
        this.addonManager.unloadAll();
    }

    /**
     * Loads ReGuilded developer badges.
     * @param {class} UserModel The class that represents user object.
     */
    loadBadges(UserModel) {
        if (!UserModel)
            return;
        
        const badgeGetter = badges.genBadgeGetter(UserModel.prototype.__lookupGetter__("badges"));
        // Adds ReGuilded developer badges
        badges.injectBadgeGetter(UserModel.prototype, badgeGetter);
    }
};
