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
     * Gets a function that has part of the given code.
     * @param {String} code The part of code that function should contain.
     * @returns {[{i: number, exports: function | {default: function}}]}
     */
    withCode(code) {
        return this.withFilter((x) => {
            // Getss it as ES module
            const { default: fn } = this.asEsModule(x.exports);
            // Checks if it is a function and has part of the code
            return typeof fn === "function" && fn.toString().includes(code);
        });
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
     * Gets a module with given child or grand-child property based on given array path.
     * @param  {...any} names The path of the property.
     * @returns {[{i: number, exports: any}]} Webpack Module Exports
     */
    withDeepProperty(...names) {
        return this.withFilter((x) => {
            // Current object to look at
            const current = x.exports;
            // Iterates through each property name/index
            for(let name of props) {
                // If it doesn't exist, ignore it
                if(!(current[name])) return false;
                // Changes current path's object
                current = current[name];
            }
            // If no issues were found, return true
            return true;
        });
    }
    /**
     * Gets exports of a Webpack module that contains class with the given property.
     * @param {String} name The name of the property that prototype should contain.
     * @returns {[{i: number, exports: function | {default: function}}]} Webpack Module Exports
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
     * @param {[[number], [function], []?, string[]?]} mod Webpack module to push
     * @returns Push return
     */
    pushModule(mod) {
        return global.webpackJsonp.push(mod);
    }
    /**
     * Removes pushed modules from WebpackJsonp with the given ID.
     * @param {number} id The identifier of the pushed module
     * @returns {[ [[number], [function], []?, string[]?], push: function]} WebpackJsonp
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
     * Methods for getting and doing Guilded stuff.
     */
    get methods() {
        return exportsOf(this.withProperty("GetChannels"));
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
    /**
     * Links to various Guilded help-center articles.
     */
    get guildedArticles() {
        return exportsOf(this.withProperty("aboutURL"));
    }
    /**
     * Various methods related to cookies in the client.
     */
    get cookies() {
        return exportsOf(this.withProperty("cookie"));
    }

    // Types and lists
    /**
     * The list of all channel and section types.
     */
    get channelTypes() {
        return exportsOf(this.withProperty("Overview"));
    }
    /**
     * The list of all external sites Guilded embeds support.
     */
    get externalSites() {
        return exportsOf(this.withProperty("ExternalSiteTypes"));
    }
    /**
     * Information about external sites Guilded embeds support, such as colours and icons.
     */
    get externalSiteInfo() {
        return exportsOf(this.withProperty("reddit"));
    }
    /**
     * All of the social medias that Guilded client recognizes.
     */
    get socialMedia() {
        return exportsOf(this.withProperty("SocialMediaTypes"));
    }
    /**
     * Captain, former member, admin, etc. infos and names.
     */
    get membershipRoles() {
        return exportsOf(this.withProperty("CaptainRoleName"));
    }
    /**
     * The list of supported games.
     */
    get gameList() {
        return exportsOf(this.withProperty("SearchableGames"));
    }
    /**
     * Draggable element names and infos.
     */
    get draggable() {
        return exportsOf(this.withProperty("DraggableTypes"));
    }
    /**
     * Links and information about guilded.gg domain.
     */
    get domainUri() {
        return exportsOf(this.withProperty("WebClient"));
    }
    /**
     * The list of social links that can be put under profile.
     */
    get profileSocialLinks() {
        return exportsOf(this.withDeepProperty("SOCIAL_LINK_CONSTS_BY_TYPE"));
    }

    // Models
    /**
     * Model class for teams.
     */
    get teamModel() {
        return exportsOf(this.withClassProperty("_teamInfo"));
    }
    /**
     * Model class for groups.
     */
    get groupModel() {
        return exportsOf(this.withProperty("GroupModel"));
    }
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
     * Model class for team members.
     */
    get memberModel() {
        return exportsOf(this.withProperty("MemberModel"));
    }
    /**
     * Model class for chat messages.
     */
    get messageModel() {
        return exportsOf(this.withClassProperty("chatMessageInfo"));
    }
    /**
     * Model class for calendar events.
     */
    get eventModel() {
        return exportsOf(this.withClassProperty("_eventInfo"));
    }
    /**
     * Model class for announcement posts.
     */
    get announcementModel() {
        return exportsOf(this.withClassProperty("_announcementInfo"));
    }
    /**
     * Model class for document channel documents.
     */
    get documentModel() {
        return exportsOf(this.withClassProperty("docInfo"));
    }
    /**
     * Model class for list channel items/tasks.
     */
    get listItemModel() {
        return exportsOf(this.withClassProperty("listItemInfo"));
    }
    /**
     * Model class for users' profile posts.
     */
    get profilePostModel() {
        return exportsOf(this.withClassProperty("_profilePostInfo"));
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
    /**
     * Gets the plugins and language settings of Prism.js.
     */
    get prismSettings() {
        return exportsOf(this.withProperty("PrismPlugins"));
    }
    /**
     * The list of language identifiers and their display names.
     */
    get languageCodes() {
        return exportsOf(this.withProperty("availableLanguageCodes"));
    }

    // Voice
    /**
     * Actions that can be performed in the voice or streaming channels, such as push-to-talk.
     */
    get voiceActions() {
        return exportsOf(this.withProperty("PushToTalk"), 2);
    }

    // Information
    /**
     * The lengths of channel names, IDs and other things related to channel settings.
     */
    get channelSettingsInfo() {
        return this.withProperty("channelSettingsInfo");
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
