import { SvgIcon, ItemManager, NullState, WordDividerLine } from "../guilded/content";
import { getOwnerInstance, patchElementRenderer, waitForElement } from "./lib";
import AddonManager from "../core/managers/addon";
import { OverflowButton } from "../guilded/menu";
import overlayWrapper from "./overlayWrapper";
import WebpackManager from "./webpack";
import { Form } from "../guilded/form";
import _React from "react";
import _ReactDOM from "react-dom";

// Provides API for addons to interact with Guilded.
// TODO: Better documentation and probably TS declaration files.

// I wanted to do a Proxy, but I don't want it to be slow af and I am in the mood to spam same
// code over and over again. Also, all my homies hate proxies /s

const cacheFns: { [method: string]: (webpack: WebpackManager) => any } = {
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
    functionUtil: webpack => webpack.withProperty("coroutine"),
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
    transientMenuPortal: _ => getOwnerInstance(document.querySelector(".TransientMenuPortalContext-portal-container")),

    OverlayProvider: webpack => webpack.withCode("OverlayProvider"),
    TeamContextProvider: webpack => webpack.withCode("EnforceTeamData"),
    DefaultContextProvider: webpack => webpack.withCode("defaultContext"),
    SavableSettings: webpack => webpack.withCode("handleSaveChanges"),

    // Settings and this user
    cookies: webpack => webpack.withProperty("cookie"),
    sounds: webpack => webpack.withProperty("IncomingCall"),
    stylePusher: webpack => webpack.withProperty("singleton"),
    chatContext: webpack => webpack.withProperty("chatContext"),
    styleGenerator: webpack => webpack.withProperty("sourceURL"),
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
    GuildedText: webpack => webpack.withCode("GuildedText"),
    RouteLink: webpack => webpack.withClassProperty("href"),
    Form: webpack => webpack.withClassProperty("formValues"),
    Modal: webpack => webpack.withClassProperty("hasConfirm"),
    MarkRenderer: webpack => webpack.withClassProperty("mark"),
    SimpleToggle: webpack => webpack.withClassProperty("input"),
    CalloutBadge: webpack => webpack.withClassProperty("style"),
    formFieldTypes: webpack => webpack.withProperty("Dropdown"),
    NullState: webpack => webpack.withClassProperty("imageSrc"),
    SearchBar: webpack => webpack.withClassProperty("_inputRef"),
    draggable: webpack => webpack.withProperty("DraggableTypes"),
    OverflowButton: webpack => webpack.withClassProperty("isOpen"),
    WordDividerLine: webpack => webpack.withCode("WordDividerLine"),
    Button: webpack => webpack.withClassProperty("useHoverContext"),
    ItemManager: webpack => webpack.withClassProperty("ItemManager"),
    HorizontalTabs: webpack => webpack.withClassProperty("tabOptions"),
    ProfilePicture: webpack => webpack.withClassProperty("borderType"),
    MarkdownRenderer: webpack => webpack.withClassProperty("plainText"),
    SvgIcon: webpack => webpack.withClassProperty("iconComponentProps"),
    ActionMenuSection: webpack => webpack.withCode("ActionMenu-section"),
    ActionMenu: webpack => webpack.withClassProperty("actionMenuHeight"),
    ActionMenuItem: webpack => webpack.withClassProperty("useRowWrapper"),
    ToggleField: webpack => webpack.withCode("ToggleFieldWrapper-container"),
    inputFieldValidations: webpack => webpack.withProperty("ValidateUserUrl"),
    UserBasicInfo: webpack => webpack.withClassProperty("userPresenceContext")
};

export default class AddonApi {
    // Values cached from getters
    _cached: { [prop: string]: any } = {};
    // Don't fetch the module 100 times if the module is undefined
    _cachedList: string[] = [];
    webpackManager: WebpackManager;
    addonManager: AddonManager;
    constructor(webpackManager: WebpackManager, addonManager: AddonManager) {
        this.webpackManager = webpackManager;
        this.addonManager = addonManager;
    }
    /**
     * Caches the value if it's not already cached and returns it.
     * @param name The name of cachable value
     * @returns The cached value
     */
    getCached(name: string): any {
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
     * @param name The name of the cached value
     * @returns The cached value
     */
    uncache(name: string): any | void {
        const i = this._cachedList.indexOf(name);

        if (~i)
            return this._cachedList.splice(i, 1)[0];
    }

    // Additional stuff(ReGuilded only)
    /**
     * Renders provided Markdown plain text as a React element.
     * @param plainText Plain text formatted in Guilded-flavoured Markdown
     * @returns Rendered Markdown
     */
    renderMarkdown(plainText: string): _React.ReactNode {
        return new this.MarkdownRenderer({ plainText, grammar: this.markdownGrammars.WebhookEmbed }).render();
    }
    /**
     * Wraps around the element to make it available to be rendered into a portal.
     * @param component The React element to wrap into a full overlay
     * @param onClose What to do when the overlay gets clicked outside
     * @returns Wrapped overlay as DOM Element
     */
    wrapOverlay(component: _React.Component, onClose: () => void): Element {
        // FIXME: Normal approach to context
        component.context = { layerContext: this.layerContext.object };

        return overlayWrapper({
            component,
            onClose,
            ReactDOM: this.ReactDOM
        });
    }
    /**
     * Creates a new portal and renders the given overlay in it.
     * @param element Element to render as overlay
     * @param portalName The name of the portal that will be rendered on
     * @returns The identifier of the portal created
     */
    renderOverlay(element: Element, portalName: string): string {
        const portalId = this.OverlayStack.addPortal(element, portalName);

        // Render overlay onto the created portal
        setImmediate(() => {
            const portalElem = this.portal.Portals[portalId]
            
            portalElem.appendChild(element);
        });
        
        // For it to be available for destruction
        return portalId;
    }
    /**
     * Gets the React component instance that owns given element.
     * @returns React owner instance
     */
    get getOwnerInstance(): (element: Element) => React.Component | void {
        return getOwnerInstance;
    }
    /**
     * 
     */
    get patchElementRenderer() {
        return patchElementRenderer;
    }
    /**
     * Waits for the given DOM element to get created.
     * @returns Created element
     */
    get waitForElement(): (query: string) => Promise<Element | Node> {
        return waitForElement;
    }

    // Private
    get transientMenuPortal() {
        return this.getCached("transientMenuPortal");
    }
    get transientMenuPortalUnmaskedContext() {
        return this.transientMenuPortal.__reactInternalMemoizedUnmaskedChildContext;
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
     * A clickable Guilded button.
     */
    get Button() {
        return this.getCached("Button")?.default;
    }
    /**
     * A badge or a flair for anything.
     */
    get CalloutBadge() {
        return this.getCached("CalloutBadge")?.default;
    }
    /**
     * Methods related to channel management.
     */
    get channelManagement() {
        return this.getCached("channelManagement")?.default;
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
     * A custom embed in a chat.
     */
    get ChatEmbed() {
        return this.getCached("ChatEmbed")?.default;
    }
    /**
     * Various methods related to cookies in the client.
     */
    get cookies() {
        return this.getCached("cookies")?.default;
    }
    get DefaultContextProvider(): <T>(cls: T) => T {
        return this.getCached("DefaultContextProvider")?.default;
    }
    /**
     * Gets the default title message for new documents.
     */
    get defaultDocTitle(): string {
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
     * Gets event configuration limitations.
     */
    get eventConfig() {
        return this.getCached("eventConfig");
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
    get Form(): typeof Form {
        return this.getCached("Form")?.default;
    }
    /**
     * The list of available field types in forms.
     */
    get formFieldTypes() {
        return this.getCached("formFieldTypes")?.default;
    }
    /**
     * The utilities related to functions.
     */
    get functionUtil(): Function & { coroutine: <T extends Function>(fn: T) => any } {
        return this.getCached("functionUtil");
    }
    /**
     * The list of supported games.
     */
    get gameList() {
        return this.getCached("gameList")?.default;
    }
    /**
     * Fetches a model for the given member.
     */
    get getMemberModel(): (memberInfo: { teamId: string; userId: string; }) => object {
        return this.getCached("MemberModel")?.getMemberModel;
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
    get GuildedText() {
        return this.getCached("GuildedText")?.default;
    }
    /**
     * The component that creates horizontal selectable content tabs.
     */
    get HorizontalTabs() {
        return this.getCached("HorizontalTabs")?.default;
    }
    /**
     * Returns the class that contains a set of validators, which either return string (error message) or void. 
     */
    get inputFieldValidations() {
        return this.getCached("inputFieldValidations")?.default;
    }
    /**
     * Returns a searchable table with filtering and other features.
     */
    get ItemManager(): typeof ItemManager {
        return this.getCached("ItemManager")?.default;
    }
    /**
     * The list of language identifiers and their display names.
     */
    get languageCodes(): { [languageId: string]: string } {
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
     */
    get MarkdownRenderer(): typeof _React.Component //typeof React.Component<{ plainText: string, grammar: PrismGrammar }, {}>
    {
        return this.getCached("MarkdownRenderer")?.default;
    }
    /**
     * Model class for team members.
     */
    get MemberModel() {
        return this.getCached("MemberModel")?.MemberModel;
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
     * Provides a component to render a Modal. Does not provide full Modal overlay.
     */
    get Modal() {
        return this.getCached("Modal")?.default;
    }
    /**
     * Provides a null-state screen component.
     */
    get NullState(): typeof NullState {
        return this.getCached("NullState")?.default;
    }
    /**
     * Returns an overflow button component that opens a menu.
     */
    get OverflowButton(): typeof OverflowButton {
        return this.getCached("OverflowButton")?.default;
    }
    /**
     * Provides a container that displays a set of overlays.
     */
    get OverlayStack() {
        return this.getCached("OverlayStack")?.default;
    }
    /**
     * Decorator for getting specific set of overlays.
     */
    get OverlayProvider() {
        return this.getCached("OverlayProvider")?.default;
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
        return this.getCached("prism");
    }
    /**
     * Gets the plugins and language settings of Prism.js.
     */
    get prismSettings() {
        return this.getCached("prismSettings");
    }
    /**
     * Profile picture of someone.
     */
    get ProfilePicture() {
        return this.getCached("ProfilePicture")?.default;
    }
    /**
     * Model class for users' profile posts.
     */
    get ProfilePostModel() {
        return this.getCached("ProfilePostModel")?.default;
    }
    /**
     * The list of social links that can be put under profile.
     */
    get profileSocialLinks() {
        return this.getCached("profileSocialLinks");
    }
    /**
     * React.JS framework stuff.
     */
    get React(): typeof _React {
        return this.getCached("React");
    }
    /**
     * React.JS framework DOM-related things.
     */
    get ReactDOM(): typeof _ReactDOM {
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
     * A clickable hyperlink component.
     */
    get RouteLink() {
        return this.getCached("RouteLink")?.default;
    }
    get SavableSettings(): <T>(settings: T) => T {
        return this.getCached("SavableSettings")?.default;
    }
    /**
     * An input made for searching.
     */
    get SearchBar() {
        return this.getCached("SearchBar")?.default;
    }
    /**
     * The list of settings tabs.
     */
    get settingsTabs(): { [tabName: string]: { id: string; label: string; calloutBadgeProps?: { text: string; color: string; }; }; } {
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
    get socialMedia(): { SocialMediaTypes: { [socialMediaName: string]: string; }; default: { [socialMediaName: string]: { label: string; icon: string; href?: string; }; }; } {
        return this.getCached("socialMedia");
    }
    /**
     * The list of all client sounds.
     */
    get sounds() {
        return this.getCached("sounds")?.default;
    }
    get styleGenerator(): (e: boolean) => ([number, string, ""][] & { toString(): string, i(e, t, a): any, local: object }) {
        return this.getCached("styleGenerator")?.default;
    }
    get stylePusher(): (style: [number, [number, string, ""][], ""], config: { insert: "head" | "body", singleton: boolean }) => Function {
        return this.getCached("stylePusher")?.default;
    }
    get SvgIcon(): typeof SvgIcon {
        return this.getCached("SvgIcon")?.default;
    }
    get TeamContextProvider(): <T>(cls: T) => T {
        return this.getCached("TeamContextProvider")?.default;
    }
    /**
     * Model class for teams.
     */
    get TeamModel() {
        return this.getCached("TeamModel")?.default;
    }
    /**
     * Component that renders user's name, profile picture, badges and other things in a line.
     */
    get UserBasicInfo() {
        return this.getCached("UserBasicInfo")?.default;
    }
    /**
     * Model class for users.
     */
    get UserModel() {
        return this.getCached("UserModel")?.UserModel;
    }
    /**
     * Utilities related to user model.
     */
    get UserModelHelper() {
        return this.getCached("UserModel")?.default;
    }
    /**
     * Divider that separates content with a line and a text in the middle.
     */
    get WordDividerLine(): typeof WordDividerLine {
        return this.getCached("WordDividerLine")?.default;
    }
}