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

    // Management
    channelManagement: webpack => webpack.withProperty("GetChannels"),

    // Guilded
    domainUri: webpack => webpack.withProperty("WebClient"),
    globalBadges: webpack => webpack.withProperty("Webhook"),
    externalSiteInfo: webpack => webpack.withProperty("reddit"),
    gameList: webpack => webpack.withProperty("SearchableGames"),
    guildedArticles: webpack => webpack.withProperty("aboutURL"),
    globalFlairsDisplayInfo: webpack => webpack.allWithProperty("guilded_gold_v1")[0],
    globalFlairsTooltipInfo: webpack => webpack.allWithProperty("guilded_gold_v1")[1],
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
    TeamModel: webpack => webpack.withClassProperty("_teamInfo"),
    GroupModel: webpack => webpack.withProperty("GroupModel"),
    ChannelModel: webpack => webpack.withProperty("ChannelModel"),

    UserModel: webpack => webpack.withProperty("UserModel"),
    MemberModel: webpack => webpack.withProperty("MemberModel"),
    ProfilePostModel: webpack => webpack.withClassProperty("_profilePostInfo"),

    EventModel: webpack => webpack.withClassProperty("_eventInfo"),
    DocumentModel: webpack => webpack.withClassProperty("docInfo"),
    ListItemModel: webpack => webpack.withClassProperty("listItemInfo"),
    MessageModel: webpack => webpack.withClassProperty("chatMessageInfo"),
    AnnouncementModel: webpack => webpack.withClassProperty("_announcementInfo"),

    // Editor and Rich text
    prism: webpack => webpack.withProperty("highlightElement"),
    editorNodes: webpack => webpack.allWithProperty("editorTypes"),
    prismSettings: webpack => webpack.withProperty("PrismPlugins"),
    editorNodeInfos: webpack => webpack.withProperty("InsertPlugins"),
    markdownGrammars: webpack => webpack.withProperty("WebhookEmbed"),
    languageCodes: webpack => webpack.withProperty("availableLanguageCodes"),

    // Components
    Modal: webpack => webpack.withClassProperty("hasConfirm"),
    SimpleToggle: webpack => webpack.withClassProperty("input"),
    formFieldTypes: webpack => webpack.withProperty("Dropdown"),
    NullState: webpack => webpack.withClassProperty("imageSrc"),
    draggable: webpack => webpack.withProperty("DraggableTypes"),
    OverflowButton: webpack => webpack.withClassProperty("isOpen"),
    GuildedForm: webpack => webpack.withClassProperty("formValues"),
    MarkdownRenderer: webpack => webpack.withClassProperty("plainText"),
    ActionMenuSection: webpack => webpack.withCode("ActionMenu-section"),
    ActionMenu: webpack => webpack.withClassProperty("actionMenuHeight"),
    ActionMenuItem: webpack => webpack.withClassProperty("useRowWrapper"),
    GuildedSvg: webpack => webpack.withClassProperty("iconComponentProps"),
    ToggleField: webpack => webpack.withCode("ToggleFieldWrapper-container"),
    inputFieldValidations: webpack => webpack.withProperty("ValidateUserUrl"),
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

    // Additional stuff(ReGuilded only)
    /**
     * Renders provided Markdown plain text as a React element.
     * @param {string} plainText Plain text formatted in Guilded-flavoured Markdown
     * @returns {React.ReactElement} Rendered Markdown
     */
    renderMarkdown(plainText) {
        return new this.MarkdownRenderer({ plainText, grammar: this.markdownGrammars.WebhookEmbed }).render();
    }


    // Alphabetical, not categorized
    /**
     * Provides a component for action menu button/item.
     */
    get ActionMenuItem() {
        return this.getCached("ActionMenuItem")?.default;
    }
    /**
     * Provides action menu component for rendering Guilded right click, overflow and other kinds of menus.
     */
    get ActionMenu() {
         return this.getCached("ActionMenu")?.default;
    }
    /**
     * Provides an action menu section that categorizes menu items.
     */
    get ActionMenuSection() {
        return this.getCached("ActionMenuSection")?.default;
    }
    /**
     * Model class for announcement posts.
     */
    get AnnouncementModel() {
        return this.getCached("AnnouncementModel")?.default;
    }
    /**
     * Model class for channels.
     */
    get ChannelModel() {
        return this.getCached("ChannelModel")?.ChannelModel;
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
        return this.getCached("chatContext")?.default;
    }
    /**
     * Various methods related to cookies in the client.
     */
    get cookies() {
        return this.getCached("cookies")?.default;
    }
    /**
     * Gets the default title message for new documents.
     */
    get defaultDocTitle() {
        return this.getCached("DocumentModel")?.DefaultDocTitle;
    }
    /**
     * Model class for document channel documents.
     */
    get DocumentModel() {
        return this.getCached("DocumentModel")?.default;
    }
    /**
     * Links and information about guilded.gg domain.
     */
    get domainUri() {
        return this.getCached("domainUri")?.default;
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
     * Model class for calendar events.
     */
    get EventModel() {
        return this.getCached("EventModel")?.default;
    }
    /**
     * The list of all external sites Guilded embeds support.
     */
    get externalSites() {
        return this.getCached("externalSites")?.default;
    }
    /**
     * Information about external sites Guilded embeds support, such as colours and icons.
     */
    get externalSiteInfo() {
        return this.getCached("externalSiteInfo")?.default;
    }
    /**
     * The list of supported games.
     */
    get gameList() {
        return this.getCached("gameList")?.default;
    }
    /**
     * The list of all global badges.
     */
    get globalBadges() {
        return this.getCached("globalBadges")?.default;
    }
    /**
     * The list of all global flairs display info.
     */
    get globalFlairsDisplayInfo() {
        return this.getCached("globalFlairsDisplayInfo");
    }
    /**
     * The list of all global flairs tooltip info.
     */
    get globalFlairsTooltipInfo() {
        return this.getCached("globalFlairsTooltipInfo");
    }
    /**
     * Model class for groups.
     */
    get GroupModel() {
        return this.getCached("GroupModel")?.GroupModel;
    }
    /**
     * Links to various Guilded help-center articles.
     */
    get guildedArticles() {
        return this.getCached("guildedArticles")?.default;
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
    get ListItemModel() {
        return this.getCached("ListItemModel")?.default;
    }
    
    /**
     * A dictionary of Markdown grammars.
     */
    get markdownGrammars() {
        return this.getCached("markdownGrammars")?.default;
    }
    /**
     * Provides a component that displays Markdown plain text.
     * @returns {(props: { plainText: string, grammar: PrismGrammar }) => React.Component}
     */
    get MarkdownRenderer() {
        return this.getCached("MarkdownRenderer")?.default;
    }
    /**
     * Model class for team members.
     */
    get MemberModel() {
        return this.getCached("MemberModel")?.MemberModel;
    }
    /**
     * Fetches a model for the given member.
     * @returns {(memberInfo: {teamId: string, userId: string}) => MemberModel}
     */
    get getMemberModel() {
        return this.getCached("MemberModel")?.getMemberModel;
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
    get MessageModel() {
        return this.getCached("MessageModel")?.default;
    }
    /**
     * Methods related to channel management.
     */
    get channelManagement() {
        return this.getCached("channelManagement")?.default;
    }
    /**
     * Provides a component to render a Modal. Does not provide full Modal overlay.
     */
    get Modal() {
        return this.getCached("Modal")?.default;
    }
    /**
     * Provides a null-state screen component.
     */
    get NullState() {
        return this.getCached("NullState")?.default;
    }
    /**
     * Returns an overflow button component that opens a menu.
     */
    get OverflowButton() {
        return this.getCached("OverflowButton")?.default;
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
     * Gets Prism library.
     */
    get prism() {
        return this.getCached("prism")?.default;
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
    get ProfilePostModel() {
        return this.getCached("ProfilePostModel")?.default;
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
    /**
     * Method for creating React elements.
     */
    get ReactElement() {
        return this.getCached("ReactElement");
    }
    /**
     * The list of REST methods for interacting with Guilded API.
     */
    get restMethods() {
        return this.getCached("restMethods")?.default;
    }
    /**
     * The list of settings tabs.
     */
    get settingsTabs() {
        return this.getCached("settingsTabs")?.default;
    }
    /**
     * Provides a simple Guilded toggle with optional label.
     */
    get SimpleToggle() {
        return this.getCached("SimpleToggle")?.default;
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
        return this.getCached("sounds")?.default;
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
    get TeamModel() {
        return this.getCached("TeamModel")?.default;
    }
    /**
     * Model class for users.
     */
    get UserModel() {
        return this.getCached("UserModel")?.UserModel;
    }
}