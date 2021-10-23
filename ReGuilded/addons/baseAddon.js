/**
 * The base addon class for ReGuilded addons.
 * @type {Window.BaseAddon}
 */
global.BaseAddon = window.BaseAddon = class BaseAddon {
    /**
     * The unique ID for the addon.
     * @type {string}
     */
    id = "";
    /**
     * The display name for the addon.
     * @type {string}
     */
    name = "";

    /**
     * Called before the addon is initialized, regardless of enabled state.
     * @param reGuilded The window.ReGuilded object.
     * @param addonManager The window.ReGuilded.addonManager object.
     */
    preinit(reGuilded, addonManager) { }

    /**
     * Called after pre-init, if the addon is enabled.
     * @param reGuilded The window.ReGuilded object.
     * @param addonManager The window.ReGuilded.addonManager object.
     * @param webpackManager The window.ReGuilded.webpackManager object.
     */
    init(reGuilded, addonManager, webpackManager) { }

    /**
     * Called when un-loading an addon. Use this to ensure your addon cleans up after itself.
     */
    uninit() { }

    /**
     * A simple error handler, formatted with the addon ID.
     * @param errors The errors to log.
     */
    handleError(...errors) {
        console.error(`%c[${this.id}]:`, "color:white", ...errors);
    }
}