import { badges, flairs, all } from "./badges-flairs";
import SettingsManager from "../../preload/settings";
import WebpackHandler from "../addons/webpack";
import ThemeHandler from "./handlers/themes";
import AddonHandler from "./handlers/addon";
import AddonApi from "../addons/addonApi";
import { WebpackRequire } from "../types/webpack";
import SettingsHandler from "./handlers/settings";

/**
 * ReGuilded's full manager's class.
 */
export default class ReGuilded {
    themes: ThemeHandler;
    addons: AddonHandler;
    settingsHandler: SettingsHandler;
    webpack?: WebpackHandler;
    addonApi?: AddonApi;
    /**
     * A class that contains all of ReGuilded's configurations and settings.
     */
    constructor() {
        this.settingsHandler = new SettingsHandler();
        // Creates Themes & Addons manager
        this.themes = new ThemeHandler(this.settingsHandler.settings.themes, this.settingsHandler);
        this.addons = new AddonHandler(this.settingsHandler.settings.addons, this.settingsHandler);
    }

    /**
     * Initiates ReGuilded
     * @param webpackRequire A function that gets Guilded modules.
     */
    init(webpackRequire: WebpackRequire) {
        this.webpack = new WebpackHandler(webpackRequire);
        this.addonApi = new AddonApi(this.webpack, this.addons);

        window.ReGuildedApi = this.addonApi;

        // Load ReGuilded developer badges & contributor flairs
        this.loadUser(this.addonApi.UserModel);

        // Initialize both Theme & Addon handlers, pass both enabled arrays into such
        this.themes.init();
        this.addons.webpack = this.webpack;
        this.addons.init(this.addonApi);

        if (window.isFirstLaunch)
            this.handleFirstLaunch();
    }


    // REVIEW: This should be called & ran when the user requests Guilded to fully exit.
    /**
     * Uninitiates ReGuilded
     */
    uninit(): void {
        this.themes.unloadAll();
        this.addons.unloadAll();
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
