/**
 * The base addon class for ReGuilded addons.
 * @type {Window.BaseAddon}
 */
export default class BaseAddon {
    id;
    /**
     * Called once when add-on is enabled before the load state.
     */
    init() { }

    /**
     * Called when add-on gets loaded or re-loaded.
     * @param addonManager The window.ReGuilded.addonManager object.
     * @param webpackManager The window.ReGuilded.webpackManager object.
     */
    load(addonManager, webpackManager) { }

    /**
     * Called when un-loading an addon. Use this to ensure your add-on cleans up after itself.
     * @param addonManager The window.ReGuilded.addonManager object.
     * @param webpackManager The window.ReGuilded.webpackManager object.
     */
    unload(addonManager, webpackManager) { }

    /**
     * A simple error handler, formatted with the addon ID.
     * @param errors The errors to log.
     */
    handleError(...errors) {
        console.error(`%c[${this.id}]:`, "color:white", ...errors);
    }
}