import { badges, flairs, all } from "./badges-flairs";
import SettingsManager from "./managers/settings";
import WebpackManager from "../addons/webpack";
import ThemesManager from "./managers/themes";
import AddonManager from "./managers/addon";
import AddonApi from "../addons/addonApi";
import { WebpackRequire } from "../types/webpack";

/**
 * ReGuilded's full manager's class.
 */
export default class ReGuilded {
    settingsManager: SettingsManager;
    themesManager: ThemesManager;
    addonManager: AddonManager;
    webpackManager?: WebpackManager;
    addonApi?: AddonApi;
    /**
     * A class that contains all of ReGuilded's configurations and settings.
     */
    constructor() {
        // Creates settings manager for configuration
        this.settingsManager = new SettingsManager();

        // Creates Themes & Addons manager
        this.themesManager = new ThemesManager(this.settingsManager.themesDir, this.settingsManager.getValueTyped("themes", "object"), this.settingsManager);
        this.addonManager = new AddonManager(this.settingsManager.addonsDir, this.settingsManager.getValueTyped("addons", "object"), this.settingsManager);
    }

    /**
     * Initiates ReGuilded
     * @param webpackRequire A function that gets Guilded modules.
     */
    init(webpackRequire: WebpackRequire) {
        this.webpackManager = new WebpackManager(webpackRequire);
        this.addonApi = new AddonApi(this.webpackManager, this.addonManager);

        window.ReGuildedApi = this.addonApi;

        // Load ReGuilded developer badges & contributor flairs
        this.loadUser(this.addonApi.UserModel);

        // Initialize both Themes & Addon manager, pass both enabled arrays into such
        this.themesManager.init();
        this.addonManager.webpack = this.webpackManager;
        this.addonManager.init(this.addonApi);

        if (window.firstLaunch)
            this.handleFirstLaunch();
    }


    // REVIEW: This should be called & ran when the user requests Guilded to fully exit.
    /**
     * Uninitiates ReGuilded
     */
    uninit(): void {
        this.themesManager.unloadAll();
        this.addonManager.unloadAll();
    }

    /**
     * Loads ReGuilded developer badges & contributor flairs.
     * @param UserModel The class that represents user object.
     */
    loadUser(UserModel): void {
        if (!UserModel) return;

        // Pushes RG Contributor Flair into the Global Flairs array, along with a Duplication Tooltip Handler from the Gil Gang flair.
        const globalFlairsInfo = this.addonApi.globalFlairsDisplayInfo;
        const globalFlairsTooltipInfo = this.addonApi.globalFlairsTooltipInfo;
        globalFlairsInfo.default["rg_contrib"] = all.contrib;
        globalFlairsTooltipInfo.default["rg_contrib"] = globalFlairsTooltipInfo.default["gil_gang"];

        // Badge Getters.
        const badgeGetter = badges.genBadgeGetter(UserModel.prototype.__lookupGetter__("badges"));
        const flairGetter = flairs.genFlairGetter(UserModel.prototype.__lookupGetter__("flairInfos"));

        console.log('Injecting');

        // Adds ReGuilded developer badges
        badges.injectBadgeGetter(UserModel.prototype, badgeGetter);
        flairs.injectFlairGetter(UserModel.prototype, flairGetter);
    }

    async handleFirstLaunch() {
        const { transientMenuPortalUnmaskedContext: portalContext, RouteLink, React } = this.addonApi;

        await portalContext.SimpleContinueOverlay.Open(portalContext, {
            heading: "Successfully Installed",
            subText: [
                "ReGuilded has successfully installed! You can now open ",
                // TODO: Link to settings "Themes"
                "theme settings",
                " or ",
                // TODO: Link to settings "Add-ons"
                "add-on settings",
                " to install any themes or add-ons you would like."
            ]
        });
    }
};
