// Provides API for addons to interact with Guilded.
// TODO: Better documentation and probably TS declaration files.

// I wanted to do a Proxy, but I don't want it to be slow af and I am in the mood to spam same
// code over and over again. Also, all my homies hate proxies /s

const cacheFns = {
    // React
    React: webpack => webpack.withProperty("createElement"),
    ReactDOM: webpack => webpack.withProperty("createPortal"),
    ReactElement: webpack => webpack.withCode("react.element"),

    // HTTP and WS
    restMethods: webpack => webpack.withProperty("getMe"),
    methods: webpack => webpack.withProperty("GetChannels"),

    // Guilded
    domainUri: webpack => webpack.withProperty("WebClient"),
    globalBadges: webpack => webpack.withProperty("Webhook"),
    externalSiteInfo: webpack => webpack.withProperty("reddit"),
    gameList: webpack => webpack.withProperty("SearchableGames"),
    guildedArticles: webpack => webpack.withProperty("aboutURL"),
    globalFlairs: webpack => webpack.withProperty("guilded_gold_v1"),
    socialMedia: webpack => webpack.withProperty("SocialMediaTypes"),
    externalSites: webpack => webpack.withProperty("ExternalSiteTypes"),

    portal: webpack => webpack.withProperty("Portals"),
    layerContext: webpack => webpack.allWithProperty("object")[1],
    OverlayStack: webpack => webpack.withProperty("addPortal"),

    // Settings and this user
    cookies: webpack => webpack.withProperty("cookie"),
    sounds: webpack => webpack.withProperty("IncomingCall"),
    chatContext: webpack => webpack.withProperty("chatContext"),
    settingsTabs: webpack => webpack.withProperty("Notifications"),

    // Team/server
    channelTypes: webpack => webpack.withProperty("Overview"),
    eventConfig: webpack => webpack.withProperty("EVENT_COLOR_LABEL_OPTIONS"),
    channelSettingsInfo: webpack => webpack.withProperty("channelSettingsInfo"),

    // User/profile
    membershipRoles: webpack => webpack.withProperty("CaptainRoleName"),
    profileSocialLinks: webpack => webpack.withProperty("SOCIAL_LINK_CONSTS_BY_TYPE"),

    // Models
    teamModel: webpack => webpack.withClassProperty("_teamInfo"),
    groupModel: webpack => webpack.withProperty("GroupModel"),
    channelModel: webpack => webpack.withProperty("ChannelModel"),

    userModel: webpack => webpack.withProperty("UserModel"),
    memberModel: webpack => webpack.withProperty("MemberModel"),
    profilePostModel: webpack => webpack.withClassProperty("_profilePostInfo"),

    eventModel: webpack => webpack.withClassProperty("_eventInfo"),
    documentModel: webpack => webpack.withClassProperty("docInfo"),
    listItemModel: webpack => webpack.withClassProperty("listItemInfo"),
    messageModel: webpack => webpack.withClassProperty("chatMessageInfo"),
    announcementModel: webpack => webpack.withClassProperty("_announcementInfo"),

    // Editor and Rich text
    editorNodes: webpack => webpack.allWithProperty("editorTypes"),
    prismSettings: webpack => webpack.withProperty("PrismPlugins"),
    editorNodeInfos: webpack => webpack.withProperty("InsertPlugins"),
    languageCodes: webpack => webpack.withProperty("availableLanguageCodes"),

    // Components
    formFieldTypes: webpack => webpack.withProperty("Dropdown"),
    draggable: webpack => webpack.withProperty("DraggableTypes"),
    GuildedForm: webpack => webpack.withClassProperty("formValues"),
    GuildedSvg: webpack => webpack.withClassProperty("iconComponentProps"),
    inputFieldValidations: webpack => webpack.withProperty("ValidateUserUrl"),
    Modal: webpack => webpack.withClassProperty("hasConfirm")
};

module.exports = class AddonApi {
    constructor(webpackManager, addonManager) {
        // Values cached from getters
        this._cached = {};
        // Don't fetch the module 100 times if the module is undefined
        this._cachedList = [];

        this.webpackManager = webpackManager;
        this.addonManager = addonManager;
    }
    /**
     * Caches the value if it's not already cached and returns it.
     * @param {string} name The name of cachable value
     * @returns {any} The cached value
     */
    getCached(name) {
        // If cached object exists, get it. Else, add it to cached array,
        // cache it and return cached value.
        return (
            ~this._cachedList.indexOf(name)
            ? this._cached[name]
            // Honestly, the only convenient thing about JS
            : (this._cachedList.push(name), this._cached[name] = cacheFns[name](this.webpackManager))
        );
    }
    /**
     * Removes the item with the given name from the cached list to be racached later.
     * @param {string} name The name of the cached value
     * @returns {any | void} The cached value
     */
    uncache(name) {
        const i = this._cachedList.indexOf(name);

        if (~i)
            return this._cachedList.splice(i, 1)[0];
    }



    // Alphabetical, not categorized
    /**
     * Model class for announcement posts.
     */
    get announcementModel() {
        return this.getCached("announcementModel");
    }
    /**
     * Model class for channels.
     */
    get channelModel() {
        return this.getCached("channelModel");
    }
    /**
     * The lengths of channel names, IDs and other things related to channel settings.
     */
    get channelSettingsInfo() {
        return this.getCached("channelSettingsInfo");
    }
    /**
     * The list of all channel and section types.
     */
    get channelTypes() {
        return this.getCached("channelTypes");
    }
    /**
     * Module with context of what channel client is looking at, channel messages, etc.
     */
    get chatContext() {
        return this.getCached("chatContext");
    }
    /**
     * Various methods related to cookies in the client.
     */
    get cookies() {
        return this.getCached("cookies");
    }
    /**
     * Model class for document channel documents.
     */
    get documentModel() {
        return this.getCached("documentModel");
    }
    /**
     * Links and information about guilded.gg domain.
     */
    get domainUri() {
        return this.getCached("domainUri");
    }
    /**
     * Draggable element names and infos.
     */
    get draggable() {
        return this.getCached("draggable");
    }


    /**
     * The list of nodes sorted by reactions, bare, etc.
     */
    get editorNodeInfos() {
        return this.getCached("editorNodeInfos");
    }
    /**
     * The list of all Slate nodes.
     */
    get editorNodes() {
        return this.getCached("editorNodes");
    }
    /**
     * The configuration of all events. Event colours and more.
     */
    get eventConfig() {
        return this.getCached("eventConfig");
    }
    /**
     * Model class for calendar events.
     */
    get eventModel() {
        return this.getCached("eventModel");
    }
    /**
     * The list of all external sites Guilded embeds support.
     */
    get externalSites() {
        return this.getCached("externalSites");
    }
    /**
     * Information about external sites Guilded embeds support, such as colours and icons.
     */
    get externalSiteInfo() {
        return this.getCached("externalSiteInfo");
    }
    /**
     * The list of supported games.
     */
    get gameList() {
        return this.getCached("gameList");
    }
    /**
     * The list of all global badges.
     */
    get globalBadges() {
        return this.getCached("globalBadges");
    }
    /**
     * The list of all global flairs display info.
     */
    get globalFlairs() {
        return this.getCached("globalFlairs");
    }
    /**
     * Model class for groups.
     */
    get groupModel() {
        return this.getCached("groupModel");
    }
    /**
     * Links to various Guilded help-center articles.
     */
    get guildedArticles() {
        return this.getCached("guildedArticles");
    }
    get GuildedForm() {
        return this.getCached("GuildedForm")?.default;
    }
    get GuildedSvg() {
        return this.getCached("GuildedSvg")?.default;
    }
    /**
     * The list of language identifiers and their display names.
     */
    get languageCodes() {
        return this.getCached("languageCodes");
    }
    /**
     * Provides layer context for Guilded portals.
     */
    get layerContext() {
        return this.getCached("layerContext");
    }
    /**
     * Model class for list channel items/tasks.
     */
    get listItemModel() {
        return this.getCached("listItemModel");
    }
    
    
    /**
     * Model class for team members.
     */
    get memberModel() {
        return this.getCached("memberModel");
    }
    /**
     * Captain, former member, admin, etc. infos and names.
     */
    get membershipRoles() {
        return this.getCached("membershipRoles");
    }
    /**
     * Model class for chat messages.
     */
    get messageModel() {
        return this.getCached("messageModel");
    }
    /**
     * Methods for getting and doing Guilded stuff.
     */
    get methods() {
        return this.getCached("methods");
    }
    get Modal() {
        return this.getCached("Modal")?.default;
    }
    /**
     * Provides a container that displays a set of overlays.
     */
    get OverlayStack() {
        return this.getCached("OverlayStack")?.default;
    }
    /**
     * Provides overlay portal.
     */
    get portal() {
        return this.getCached("portal")?.default;
    }
    /**
     * Gets the plugins and language settings of Prism.js.
     */
    get prismSettings() {
        return this.getCached("prismSettings");
    }
    /**
     * Model class for users' profile posts.
     */
    get profilePostModel() {
        return this.getCached("profilePostModel");
    }
    /**
     * React.JS framework stuff.
     */
    get React() {
        return this.getCached("React");
    }
    /**
     * React.JS framework DOM-related things.
     */
    get ReactDOM() {
        return this.getCached("ReactDOM");
    }
    get ReactElement() {
        return this.getCached("ReactElement");
    }
    /**
     * All of the REST API methods.
     */
    get restMethods() {
        return this.getCached("restMethods");
    }
    /**
     * The list of settings tabs.
     */
    get settingsTabs() {
        return this.getCached("settingsTabs");
    }
    /**
     * All of the social medias that Guilded client recognizes.
     */
    get socialMedia() {
        return this.getCached("socialMedia");
    }
    /**
     * The list of all client sounds.
     */
    get sounds() {
        return this.getCached("sounds");
    }
    /**
     * The list of social links that can be put under profile.
     */
    get profileSocialLinks() {
        return this.getCached("profileSocialLinks");
    }
    /**
     * Model class for teams.
     */
    get teamModel() {
        return this.getCached("teamModel");
    }
    /**
     * Model class for users.
     */
    get userModel() {
        return this.getCached("userModel");
    }
}