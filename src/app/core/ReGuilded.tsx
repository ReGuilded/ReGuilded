import { badges, flairs, all } from "./badges-flairs";
import { WebpackRequire } from "../types/webpack";
import SettingsHandler from "./handlers/settings";
import WebpackHandler from "../addons/webpack";
import ThemeHandler from "./handlers/themes";
import AddonHandler from "./handlers/addon";
import AddonApi from "../addons/addonApi";
import { FormSpecs } from "../guilded/form";
import SettingsInjector from "./settings/settings";
import { AddonApiExports } from "../addons/addonApi.types";

/**
 * ReGuilded's full manager's class.
 */
export default class ReGuilded {
    themes: ThemeHandler;
    addons: AddonHandler;
    settingsHandler: SettingsHandler;
    webpack?: WebpackHandler;
    styling?: Element;
    /**
     * A class that contains all of ReGuilded's configurations and settings.
     */
    constructor() {
        this.settingsHandler = new SettingsHandler();
        // Creates Themes & Addons manager
        this.themes = new ThemeHandler(this, this.settingsHandler.settings.themes, this.settingsHandler, window.ReGuildedConfig.themes);
        this.addons = new AddonHandler(this, this.settingsHandler.settings.addons, this.settingsHandler, window.ReGuildedConfig.addons);
    }

    /**
     * Initiates ReGuilded
     * @param webpackRequire A function that gets Guilded modules.
     */
    async init(webpackRequire: WebpackRequire) {
        return new Promise<void>(
            async (resolve, reject) => {
                this.webpack = new WebpackHandler(webpackRequire);

                // For add-on and theme CSS
                this.styling = Object.assign(document.createElement("datagroup"), {
                    id: "ReGuildedStyle-container"
                });
                this.styling.append(
                    Object.assign(document.createElement("style"), {
                        id: "ReGuildedStyle-datagroup",
                        innerHTML: "datagroup{display:none;}"
                    }),
                    Object.assign(document.createElement("style"), {
                        id: "ReGuildedStyle-reguilded",
                        innerHTML: `.ReGuildedExtensionImages-image{position:relative;min-width:250px;height:250px}.ReGuildedExtensionImages-image:not(:first-child){margin-left:10px}.ReGuildedSettings-container-padded{padding-left:32px;padding-right:32px}.ReGuildedErrorBoundary-error{text-align:left}.ReGuildedExtensions-container{padding-bottom:10px}.ReGuildedExtensions-grid{grid-auto-rows:260px}.ReGuildedExtensionPage-warning{margin-bottom:16px}`
                    })
                );
                document.body.appendChild(this.styling);

                // I don't even have any idea why they are being disabled
                try {
                    window.__SENTRY__.hub.getClient().close(0);
                    window.__SENTRY__.logger.disable();
                } catch(e) {
                    console.warn("Failed to disable sentries:", e);
                }

                this.addons.webpack = this.webpack;

                await this.addons.init()
                    // TODO: Perhaps async init for themes and then Promise.all?
                    .then(this.themes.init.bind(this.themes))
                    .then(resolve)
                    .catch(reject);
            }
        )
            .catch(e => console.error("ReGuilded failed to initialize:", e))
            .then(async () =>
                // Tasks that aren't critical
                await Promise.all([
                    import("./settings/settings").then(async ({ default: SettingsInjector }) =>
                        await (window.settingsInjector = new SettingsInjector()).init()
                    ),

                    window.ReGuildedConfig.isFirstLaunch && this.handleFirstLaunch(),

                    // Only do it if user has enabled auto-update
                    this.settingsHandler.settings.autoUpdate &&
                        window.ReGuildedConfig.doUpdateIfPossible()
                            .catch(e => console.error("Error while trying to auto-update:", e)),
                ])
                    // I don't know where to put this dumdum sync method
                    .then(() => this.settingsHandler.settings.badge && this.loadUserBadges(this.getApiProperty("guilded/users").UserModel))
            );
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
    loadUserBadges(UserModel): void {
        if (!UserModel) return;

        // Pushes RG Contributor Flair into the Global Flairs array, along with a Duplication Tooltip Handler from the Gil Gang flair.
        const globalFlairsInfo = this.getApiProperty("guilded/users/flairs/displayInfo");
        const globalFlairsTooltipInfo = this.getApiProperty("guilded/users/flairs/tooltipInfo");
        globalFlairsInfo.default["rg_contrib"] = all.contrib;
        globalFlairsTooltipInfo.default["rg_contrib"] = globalFlairsTooltipInfo.default["gil_gang"];

        // Badge Getters.
        const badgeGetter = badges.genBadgeGetter(UserModel.prototype.__lookupGetter__("badges"));
        const flairGetter = flairs.genFlairGetter(UserModel.prototype.__lookupGetter__("flairInfos"));

        this.settingsHandler.settings.debugMode && console.log('Injecting');

        // Adds ReGuilded developer badges
        badges.injectBadgeGetter(UserModel.prototype, badgeGetter);
        flairs.injectFlairGetter(UserModel.prototype, flairGetter);
    }

    getApiProperty<T extends string>(name: T): AddonApiExports<T> {
        return AddonApi.getApiCachedProperty<T>(name, this.webpack);
    }

    async handleFirstLaunch() {
        const transientMenuPortal = window.ReGuilded.getApiProperty("transientMenuPortal"),
            RouteLink = window.ReGuilded.getApiProperty("guilded/components/RouteLink");

        const menuPortalContext = transientMenuPortal.__reactInternalMemoizedUnmaskedChildContext;

        const formSpecs: FormSpecs =
            {
                description: [
                    "ReGuilded has successfully installed! You can now open ",
                    // TODO: Link to settings "Themes"
                    "theme settings",
                    " or ",
                    // TODO: Link to settings "Addons"
                    "addon settings",
                    " to install any themes or addons you would like. If you would like to receive ReGuilded updates out of the box, be sure to check the checkbox below:"
                ],
                sections: [
                    {
                        fieldSpecs: [
                            {
                                type: "Checkboxes",
                                fieldName: "settings",

                                isOptional: true,

                                options: [
                                    {
                                        optionName: "autoUpdate",
                                        label: "Auto-Update ReGuilded",
                                        description: "Any time Guilded gets refreshed or launches, ReGuilded will check for its own updates and install them if they exist."
                                    }
                                ],
                                defaultValue: [
                                    {
                                        optionName: "autoUpdate",
                                        value: false
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

        const { values, isChanged } = await menuPortalContext.SimpleFormOverlay.Open(menuPortalContext, {
            header: "Successfully Installed",
            confirmText: "Continue",
            controlConfiguration: "Confirm",
            formSpecs
        });

        // Only apply settings if any of the settings were modified
        if (isChanged) {
            // Use mapping if more options appear
            const [ { optionName, value } ] = values.settings;
            this.settingsHandler.updateSettings({ [optionName]: value });
        }
    }
};
