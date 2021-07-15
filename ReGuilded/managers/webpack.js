/**
 * The manager that deals with Webpack-related things, especially modules.
 */
module.exports = class WebpackManager {
    /**
     * The manager that deals with Webpack-related things, especially modules.
     * @param {Function} webpackRequire Function that gives the exports of a given module.
     */
    constructor(webpackRequire) {
        this._webpackRequire = webpackRequire;
        this._webpackExports = webpackRequire.c;
        this._webpackExportList = Object.values(this._webpackExports);
        this._webpackModules = webpackRequire.m;

        this.asEsModule = webpackRequire(0);
    }
    /**
     * Gets Webpack module's exports with specific ID attached
     * @param {Number} id Gets module by the identifier
     * @returns Webpack Module Exports
     */
    withId(id) {
        return this._asModule(this._webpackRequire(id));
    }
    /**
     * Gets Webpack module's exports using specific filter
     * @param {(mod: {i: number, exports: any}) => Boolean} fn Function to filter modules with.
     * @returns {[{i: number, exports: any}]} Webpack Module Exports
     */
    withFilter(fn) {
        return this._webpackExportList.filter(fn);
    }
    /**
     * Gets exports of a Webpack module that has specific property.
     * @param {String} name The name of the property that the module should contain.
     * @returns {[{i: number, exports: any}]} Webpack Module Exports
     */
    withProperty(name) {
        return this.withFilter((x) => {
            // Gets it as ES Module
            const { default: obj, ...rest } = this.asEsModule(x.exports);
            // Returns whether it contains that property
            return obj && (obj[name] || rest[name]);
        });
    }
    /**
     * Gets exports of a Webpack module that contains class with the given property.
     * @param {String} name The name of the property that prototype should contain.
     * @returns {[{i: number, exports: any}]} Webpack Module Exports
     */
    withClassProperty(name) {
        return this.withFilter((x) => {
            // Fetches the type
            const { default: type } = this.asEsModule(x.exports);
            // Checks if it's a function with property in prototypes
            return typeof type === "function" && type.prototype && type.prototype?.hasOwnProperty?.(name);
        });
    }
    /**
     * Gets a module from WebpackJsonp.
     * @param {number} id The identifier of the pushed module
     * @returns WebpackJsonp module
     */
    getPushedModule(id) {
        return global.webpackJsonp.find((x) => x[0][0] === id);
    }
    /**
     * Pushes a new module to webpackJsonp
     * @param {[[Number], [Function], [], [String]]} mod Webpack module to push
     * @returns Push return
     */
    pushModule(mod) {
        return global.webpackJsonp.push(mod);
    }
    /**
     * Removes pushed modules from WebpackJsonp with the given ID.
     * @param {number} id The identifier of the pushed module
     * @returns WebpackJsonp
     */
    removeModules(id) {
        // Filtered webpackJsonp without the module
        const filtered = global.webpackJsonp.filter((x) => x[0][0] !== id);
        // Sets new webpackJsonp
        global.webpackJsonp = filtered;
        // Returns webpackJsonp
        return filtered;
    }

    // Client stuff
    /**
     * All of the REST API methods.
     */
    get restMethods() {
        return exportsOf(this.withProperty("getMe"));
    }
    /**
     * Module with context of what channel client is looking at, channel messages, etc.
     */
    get chatContext() {
        return exportsOf(this.withProperty("chatContext"));
    }
    /**
     * The list of all client sounds.
     */
    get sounds() {
        return exportsOf(this.withProperty("IncomingCall"));
    }
    /**
     * The list of settings tabs.
     */
    get settingsTabs() {
        return exportsOf(this.withProperty("Notifications"));
    }
    /**
     * The list of all global badges.
     */
    get globalBadges() {
        return exportsOf(this.withProperty("Webhook"));
    }

    // Models
    /**
     * Model class for channels.
     */
    get channelModel() {
        return exportsOf(this.withProperty("ChannelModel"));
    }
    /**
     * Model class for users.
     */
    get userModel() {
        return exportsOf(this.withProperty("UserModel"));
    }
    /**
     * Model class for chat messages.
     */
    get messageModel() {
        return exportsOf(this.withClassProperty("chatMessageInfo"));
    }
    /**
     * The list of all channel and section types.
     */
    get channelTypes() {
        return exportsOf(this.withProperty("Overview"));
    }

    // Slate stuff
    /**
     * The list of nodes sorted by reactions, bare, etc.
     */
    get editorNodeInfos() {
        return exportsOf(this.withProperty("InsertPlugins"));
    }
    /**
     * The list of all Slate nodes.
     */
    get editorNodes() {
        return this.withProperty("editorTypes").map((x) => x?.exports);
    }
};
/**
 * Gets exports of a Webpack module at given index.
 * @param {[{i: number, l: boolean, exports: any}]} mods The array of Webpack modules.
 * @param {number} index The index of the module to get export's of.
 * @returns Webpack Module Exports
 */
function exportsOf(mods, index = 0) {
    return mods[index]?.exports;
}
