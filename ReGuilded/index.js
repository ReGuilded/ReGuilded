const { SettingsManager, ThemesManager, AddonManager, WebpackManager, AddonApi } = require("./managers");
const { badges, flairs, all } = require('./badges-flairs.js');
const compiler = require("./libs/compiler");
const { readFileSync } = require("fs");
const { join } = require("path");

/**
 * ReGuilded's full manager's class.
 */
module.exports = class ReGuilded {
    /**
     * A class that contains all of ReGuilded's configurations and settings.
     */
    constructor() {
        // Creates settings manager for configuration
        this.settingsManager = new SettingsManager();

        // Creates Themes & Addons manager
        this.themesManager = new ThemesManager(this.settingsManager.getThemesDir());
        this.addonManager = new AddonManager(this.settingsManager.getAddonsDir(), this);
    }

    /**
     * Initiates ReGuilded
     * @param {Function} webpackRequire A function that gets Guilded modules.
     */
    init(webpackRequire) {
        // Handle First Launch popup
        if (global.firstLaunch)
            this.handleFirstLaunch();

        // Patch the requires
        compiler.patchRequires();

        // Adds Webpack stuff to addon manager
        this.addonManager.webpackRequire = webpackRequire;
        this.addonManager.webpackModules = webpackRequire.c;
        this.addonManager.webpackFunctions = webpackRequire.m;

        // Declaring Themes & Addons config
        const themeConfig = this.settingsManager.getValueTyped("themes", "object"),
            addonConfig = this.settingsManager.getValueTyped("addons", "object");

        // Declaring Enabling Themes & Addons
        const enabledThemes = themeConfig.enabled,
            enabledAddons = addonConfig.enabled;

        // Whether it should be initialized
        this.webpackManager = new WebpackManager(webpackRequire);
        this.addonApi = new AddonApi(this.webpackManager, this.addonManager);

        // Load ReGuilded developer badges & contributor flairs
        this.loadUser(this.addonApi.UserModel);

        // Initialize both Themes & Addon manager, pass both enabled arrays into such
        this.themesManager.init(enabledThemes);
        this.addonManager.init(enabledAddons);
    }


    // REVIEW: This should be called & ran when the user requests Guilded to fully exit.
    /**
     * Uninitiates ReGuilded
     */
    uninit() {
        this.themesManager.unloadThemes();
        this.addonManager.unloadAll();
    }

    /**
     * Loads ReGuilded developer badges & contributor flairs.
     * @param {class} UserModel The class that represents user object.
     */
    loadUser(UserModel) {
        if (!UserModel) return;

        // Pushes RG Contributor Badge into the Global Flairs array, along with a Duplication Tooltip Handler from the Gil Gang flair.
        const globalFlairsInfo = this.addonApi.globalFlairsDisplayInfo;
        const globalFlairsExtendedInfo = this.addonApi.globalFlairsTooltipInfo;
        globalFlairsInfo.default["rg_contrib"] = all.contrib
        globalFlairsExtendedInfo.default["rg_contrib"] = globalFlairsExtendedInfo.default["gil_gang"];

        // Badge Getters.
        const badgeGetter = badges.genBadgeGetter(UserModel.prototype.__lookupGetter__("badges"));
        const flairGetter = flairs.genFlairGetter(UserModel.prototype.__lookupGetter__("flairInfos"));

        // Adds ReGuilded developer badges
        badges.injectBadgeGetter(UserModel.prototype, badgeGetter);
        flairs.injectFlairGetter(UserModel.prototype, flairGetter);
    }

    handleFirstLaunch() {
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
};
