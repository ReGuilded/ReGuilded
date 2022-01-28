import {
    SvgIcon,
    ItemManager,
    NullState,
    WordDividerLine,
    BannerWithButton,
    MediaRenderer,
    GuildedText,
    CodeContainer
} from "../guilded/components/content";
import { getOwnerInstance, patchElementRenderer, waitForElement } from "./lib";
import { Carousel as CarouselList } from "../guilded/components/sections";
import * as prismjsComponents from "prismjs/components";
import AddonHandler, { AddonPermission } from "../core/handlers/addon";
import { OverflowButton } from "../guilded/menu";
import { Button } from "../guilded/input";
import WebpackManager from "./webpack";
import { Form } from "../guilded/form";
import * as prismjs from "prismjs";
import _ReactDOM from "react-dom";
import { Grammar } from "prismjs";
import _React from "react";
import { Addon } from "../../common/extensions";

// Provides API for addons to interact with Guilded.
// TODO: Better documentation and probably TS declaration files.

// I wanted to do a Proxy, but I don't want it to be slower.

const cacheFns: { [method: string]: (webpack: WebpackManager) => any } = {
    // React
    react: webpack => webpack.withProperty("createElement"),
    "react-dom": webpack => webpack.withProperty("createPortal"),
    "react-element": webpack => webpack.withCode("react.element"),

    // HTTP and WS
    "guilded/http/rest": webpack => webpack.withProperty("getMe"),

    // Teams / Servers
    "guilded/teams/games": webpack => webpack.withProperty("SearchableGames"),
    "guilded/teams/TeamModel": webpack => webpack.withClassProperty("_teamInfo"),

    // Users / Members
    "guilded/users": webpack => webpack.withProperty("UserModel"),
    "guilded/users/badges": webpack => webpack.withProperty("Webhook"),
    "guilded/users/members": webpack => webpack.withProperty("MemberModel"),
    "guilded/users/flairs/displayInfo": webpack => webpack.allWithProperty("guilded_gold_v1")[0],
    "guilded/users/flairs/tooltipInfo": webpack => webpack.allWithProperty("guilded_gold_v1")[1],
    "guilded/profile/PostModel": webpack => webpack.withClassProperty("_profilePostInfo"),
    "guilded/profile/socialLinks": webpack => webpack.withProperty("SOCIAL_LINK_CONSTS_BY_TYPE"),

    // Roles
    "guilded/roles/membership": webpack => webpack.withProperty("CaptainRoleName"),

    // Groups
    "guilded/groups": webpack => webpack.withProperty("GroupModel"),

    // Channels
    "guilded/channels": webpack => webpack.withProperty("ChannelModel"),
    "guilded/channels/types": webpack => webpack.withProperty("Overview"),
    "guilded/channels/management": webpack => webpack.withProperty("GetChannels"),
    "guilded/channels/settings": webpack => webpack.withProperty("channelSettingsInfo"),
    "guilded/channels/content/AnnouncementModel": webpack => webpack.withClassProperty("_announcementInfo"),
    "guilded/channels/content/DocumentModel": webpack => webpack.withClassProperty("docInfo"),
    "guilded/channels/content/EventModel": webpack => webpack.withClassProperty("_eventInfo"),
    "guilded/channels/content/ListItemModel": webpack => webpack.withClassProperty("listItemInfo"),
    "guilded/channels/content/MessageModel": webpack => webpack.withClassProperty("chatMessageInfo"),
    "guilded/channels/content/eventInfo": webpack => webpack.withProperty("EVENT_COLOR_LABEL_OPTIONS"),

    // URLs
    "guilded/urls/domain": webpack => webpack.withProperty("WebClient"),
    "guilded/urls/externalSites": webpack => webpack.withProperty("ExternalSiteTypes"),
    "guilded/urls/externalSiteInfos": webpack => webpack.withProperty("reddit"),
    "guilded/urls/articles": webpack => webpack.withProperty("aboutURL"),
    "guilded/urls/socialMedia": webpack => webpack.withProperty("SocialMediaTypes"),

    // Editor and Rich text
    prism: webpack => webpack.withProperty("highlightElement"),
    "prism/info": webpack => webpack.withProperty("prismComponents"),
    "guilded/editor/nodes": webpack => webpack.allWithProperty("editorTypes"),
    "guilded/editor/nodeInfos": webpack => webpack.withProperty("InsertPlugins"),
    "guilded/editor/grammars": webpack => webpack.withProperty("WebhookEmbed"),
    "guilded/editor/languageCodes": webpack => webpack.withProperty("availableLanguageCodes"),

    // Settings
    "guilded/settings/savableSettings": webpack => webpack.withCode("handleSaveChanges"),
    "guilded/settings/tabs": webpack => webpack.withProperty("Notifications"),

    // App stuff
    "guilded/app/sounds": webpack => webpack.withProperty("IncomingCall"),

    // Overlays
    "guilded/overlays/portal": webpack => webpack.withProperty("Portals"),
    "guilded/overlays/OverlayStack": webpack => webpack.withProperty("addPortal"),
    "guilded/overlays/overlayProvider": webpack => webpack.withCode("OverlayProvider"),
    transientMenuPortal: _ => getOwnerInstance(document.querySelector(".TransientMenuPortalContext-portal-container")),

    // Context
    "guilded/context/layerContext": webpack => webpack.allWithProperty("object")[1],
    "guilded/context/teamContextProvider": webpack => webpack.withCode("EnforceTeamData"),
    "guilded/context/defaultContextProvider": webpack => webpack.withCode("defaultContext"),
    "guilded/context/chatContext": webpack => webpack.withProperty("chatContext"),

    // Util
    "guilded/util/functions": webpack => webpack.withProperty("coroutine"),

    // Components
    "guilded/components/Form": webpack => webpack.withClassProperty("formValues"),
    "guilded/components/formFieldTypes": webpack => webpack.withProperty("Dropdown"),
    "guilded/components/formValidations": webpack => webpack.withProperty("ValidateUserUrl"),
    "guilded/components/MarkdownRenderer": webpack => webpack.withClassProperty("plainText"),
    "guilded/components/CalloutBadge": webpack => webpack.withClassProperty("style"),
    "guilded/components/GuildedText": webpack => webpack.withCode("GuildedText"),
    "guilded/components/RouteLink": webpack => webpack.withClassProperty("href"),
    "guilded/components/Button": webpack => webpack.withClassProperty("useHoverContext"),
    "guilded/components/SvgIcon": webpack => webpack.withClassProperty("iconComponentProps"),
    "guilded/components/NullState": webpack => webpack.withClassProperty("imageSrc"),
    "guilded/components/HorizontalTabs": webpack => webpack.withClassProperty("tabOptions"),
    "guilded/components/ToggleField": webpack => webpack.withCode("ToggleFieldWrapper-container"),
    "guilded/components/SimpleToggle": webpack => webpack.withClassProperty("input"),
    "guilded/components/MediaRenderer": webpack => webpack.withClassProperty("progressiveImageHasLoaded"),
    "guilded/components/CodeContainer": webpack => webpack.withClassProperty("tokenCodeLines"),
    "guilded/components/SearchBar": webpack => webpack.withClassProperty("_inputRef"),
    "guilded/components/ItemManager": webpack => webpack.withClassProperty("ItemManager"),
    "guilded/components/OverflowButton": webpack => webpack.withClassProperty("isOpen"),
    "guilded/components/BannerWithButton": webpack => webpack.withClassProperty("hasText"),
    "guilded/components/UserBasicInfo": webpack => webpack.withClassProperty("userPresenceContext"),
    "guilded/components/ProfilePicture": webpack => webpack.withClassProperty("borderType"),
    "guilded/components/CarouselList": webpack => webpack.withClassProperty("overflowRight"),
    "guilded/components/LoadingPage": webpack => webpack.withCode("LoadingPage"),
    "guilded/components/WordDividerLine": webpack => webpack.withCode("WordDividerLine"),
    "guilded/components/StretchFadeBackground": webpack => webpack.withCode("StretchFadeBackground"),
    "guilded/components/ActionMenu": webpack => webpack.withClassProperty("actionMenuHeight"),
    "guilded/components/ActionMenuSection": webpack => webpack.withCode("ActionMenu-section"),
    "guilded/components/ActionMenuItem": webpack => webpack.withClassProperty("useRowWrapper"),
    "guilded/components/Modal": webpack => webpack.withClassProperty("hasConfirm"),
    "guilded/components/MarkRenderer": webpack => webpack.withClassProperty("mark"),
    "guilded/components/draggable": webpack => webpack.withProperty("DraggableTypes")
};

export default class AddonApi {
    // Values cached from getters
    static _cached: { [prop: string]: any } = {};
    // Don't fetch the module 100 times if the module is undefined
    static _cachedList: string[] = [];
    // Make it break less
    static _moduleNotFound = { default: undefined };

    // Don't allow addons to fetch this with `require("webpackManager")`
    #webpackManager: WebpackManager;
    #addonManager: AddonHandler;
    #addonId: string;

    ["reguilded/util"]: {
        getOwnerInstance: typeof getOwnerInstance;
        patchElementRenderer: typeof patchElementRenderer;
        waitForElement: typeof waitForElement;
        renderMarkdown: (plainText: string) => _React.ReactNode;
    };

    // If addon needs it
    constructor(webpackManager: WebpackManager, addonManager: AddonHandler, addonId: string) {
        this.#webpackManager = webpackManager;
        this.#addonManager = addonManager;
        this.#addonId = addonId;

        this["reguilded/util"] = {
            getOwnerInstance,
            patchElementRenderer,
            waitForElement,
            renderMarkdown: (plainText: string) =>
                new this["guilded/components/MarkdownRenderer"].default({
                    plainText,
                    grammar: this["guilded/editor/grammars"].default.WebhookEmbed
                }).render()
        };
    }
    /**
     * Caches the value if it's not already cached and returns it.
     * @param name The name of cachable value
     * @returns The cached value
     */
    #getCached(name: string): any {
        return getApiCachedProperty(name, this.#webpackManager);
    }
    /**
     * Caches the value if it's not already cached and returns it. Requires specified permissions.
     * @param permissions The permissions that it requires
     * @param name The name of cachable value
     * @returns The cached value
     */
    #getCachedWithPermissions(permissions: AddonPermission, name: string) {
        return this.#hasPermissions(permissions) && this.#getCached(name);
    }
    /**
     * Gets whether there is the specified permission.
     * @param permissions The permission that is needed
     * @returns Permission or 0
     */
    #hasPermissions(permissions: AddonPermission) {
        return this.#addonManager.hasPermission(this.#addonId, permissions);
    }
    /**
     * Removes the item with the given name from the cached list to be racached later.
     * @param name The name of the cached value
     * @returns The cached value
     */
    static uncache(name: string): any | void {
        const i = AddonApi._cachedList.indexOf(name);

        if (~i) return AddonApi._cachedList.splice(i, 1)[0];
    }

    // Private
    get transientMenuPortal() {
        return this.#getCached("transientMenuPortal");
    }
    get transientMenuPortalUnmaskedContext() {
        return this.transientMenuPortal.__reactInternalMemoizedUnmaskedChildContext;
    }

    // React
    /**
     * React.JS framework stuff.
     */
    get react(): typeof _React {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "react");
    }
    /**
     * React.JS framework DOM-related things.
     */
    get ["react-dom"](): typeof _ReactDOM {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "react-dom");
    }
    /**
     * Method for creating React elements.
     */
    get ["react-element"]() {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "react-element");
    }

    // HTTPS and WS
    /**
     * The list of REST methods for interacting with Guilded API.
     */
    get ["guilded/http/rest"]() {
        return this.#getCachedWithPermissions(AddonPermission.UseApi, "guilded/http/rest");
    }

    // Teams / Servers
    /**
     * The list of supported games.
     */
    get ["guilded/teams/games"]() {
        return this.#getCached("guilded/teams/games");
    }
    /**
     * Model class for teams.
     */
    get ["guilded/teams/TeamModel"](): { default: typeof Object } {
        return this.#getCached("guilded/teams/TeamModel");
    }

    // Users / Members
    /**
     * The list of all global badges.
     */
    get ["guilded/users/badges"]() {
        return this.#getCached("guilded/users/badges");
    }
    /**
     * The list of all global flairs display info.
     */
    get ["guilded/users/flairs/displayInfo"]() {
        return this.#getCached("guilded/users/flairs/displayInfo");
    }
    /**
     * The list of all global flairs tooltip info.
     */
    get ["guilded/users/flairs/tooltipInfo"]() {
        return this.#getCached("guilded/users/flairs/tooltipInfo");
    }
    /**
     * Model class for users.
     */
    get ["guilded/users"](): { UserModel: typeof Object } {
        return this.#getCached("guilded/users");
    }
    /**
     * Fetches a model for the given member.
     */
    get ["guilded/users/members"](): {
        MemberModel: typeof Object;
        getMemberModel: (memberInfo: { teamId: string; userId: string }) => object;
    } {
        return this.#getCachedWithPermissions(AddonPermission.ExtraInfo, "guilded/users/members");
    }
    /**
     * Model class for users' profile posts.
     */
    get ["guilded/profile/PostModel"]() {
        return this.#getCached("guilded/profile/PostModel");
    }
    /**
     * The list of social links that can be put under profile.
     */
    get ["guilded/profile/socialLinks"]() {
        return this.#getCached("guilded/profile/socialLinks");
    }

    // Roles
    /**
     * Captain, former member, admin, etc. infos and names.
     */
    get ["guilded/roles/membership"]() {
        return this.#getCached("guilded/roles/membership");
    }

    // Groups
    /**
     * Model class for groups.
     */
    get ["guilded/groups"](): { GroupModel: typeof Object } {
        return this.#getCached("guilded/groups");
    }

    // Channels
    /**
     * Model class for channels.
     */
    get ["guilded/channels"](): { ChannelModel: typeof Object } {
        return this.#getCached("guilded/channels");
    }
    /**
     * The list of all channel and section types.
     */
    get ["guilded/channels/types"]() {
        return this.#getCached("guilded/channels/types");
    }
    /**
     * Methods related to channel management.
     */
    get ["guilded/channels/management"]() {
        return this.#getCachedWithPermissions(AddonPermission.ExtraInfo, "guilded/channels/management");
    }
    /**
     * The lengths of channel names, IDs and other things related to channel settings.
     */
    get ["guilded/channels/settings"]() {
        return this.#getCached("guilded/channels/settings");
    }
    /**
     * Model class for announcement posts.
     */
    get ["guilded/channels/content/AnnouncementModel"](): { default: typeof Object } {
        return this.#getCached("guilded/channels/content/AnnouncementModel");
    }
    /**
     * Model class for document channel documents.
     */
    get ["guilded/channels/content/DocumentModel"](): { default: typeof Object } {
        return this.#getCached("guilded/channels/content/DocumentModel");
    }
    /**
     * Model class for calendar events.
     */
    get ["guilded/channels/content/EventModel"](): { default: typeof Object } {
        return this.#getCached("guilded/channels/content/EventModel");
    }
    /**
     * Model class for list channel items/tasks.
     */
    get ["guilded/channels/content/ListItemModel"](): { default: typeof Object } {
        return this.#getCached("guilded/channels/content/ListItemModel");
    }
    /**
     * Model class for chat messages.
     */
    get ["guilded/channels/content/MessageModel"](): { default: typeof Object } {
        return this.#getCached("guilded/channels/content/MessageModel");
    }
    /**
     * Gets event configuration limitations.
     */
    get ["guilded/channels/content/eventInfo"]() {
        return this.#getCached("guilded/channels/content/eventInfo");
    }

    // URLs
    /**
     * Links to various Guilded help-center articles.
     */
    get ["guilded/urls/articles"]() {
        return this.#getCached("guilded/urls/articles");
    }
    /**
     * Links and information about guilded.gg domain.
     */
    get ["guilded/urls/domain"]() {
        return this.#getCached("guilded/urls/domain");
    }
    /**
     * The list of all external sites Guilded embeds support.
     */
    get ["guilded/urls/externalSites"]() {
        return this.#getCached("guilded/urls/externalSites");
    }
    /**
     * Information about external sites Guilded embeds support, such as colours and icons.
     */
    get ["guilded/urls/externalSiteInfos"]() {
        return this.#getCached("guilded/urls/externalSiteInfos");
    }
    /**
     * All of the social medias that Guilded client recognizes.
     */
    get ["guilded/urls/socialMedia"](): {
        SocialMediaTypes: { [socialMediaName: string]: string };
        default: { [socialMediaName: string]: { label: string; icon: string; href?: string } };
    } {
        return this.#getCached("guilded/urls/socialMedia");
    }

    // Editors and Markdown
    /**
     * Gets Prism library.
     */
    get prism(): typeof prismjs {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "prism");
    }
    /**
     * Gets the plugins and language settings of Prism.js.
     */
    get ["prism/components"](): typeof prismjsComponents {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "prism/info")?.prismComponents;
    }
    /**
     * The list of all Slate nodes.
     */
    get ["guilded/editor/nodes"]() {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/editor/nodes");
    }
    /**
     * The list of nodes sorted by reactions, bare, etc.
     */
    get ["guilded/editor/nodeInfos"]() {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/editor/nodeInfos");
    }
    /**
     * A dictionary of Markdown grammars.
     */
    get ["guilded/editor/grammars"](): { default: { WebhookEmbed: Grammar } } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/editor/grammars");
    }
    /**
     * The list of language identifiers and their display names.
     */
    get ["guilded/editor/languageCodes"](): { default: { [languageId: string]: string } } {
        return this.#getCached("guilded/editor/languageCodes");
    }
    /**
     * The list of all client sounds.
     */
    get ["guilded/app/sounds"]() {
        return this.#getCachedWithPermissions(AddonPermission.ExtraInfo, "guilded/app/sounds");
    }

    // Settings
    get ["guilded/settings/savableSettings"](): { default: <T>(settings: T) => T } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/settings/savableSettings");
    }
    /**
     * The list of settings tabs.
     */
    get ["guilded/settings/tabs"](): {
        default: {
            [tabName: string]: {
                id: string;
                label: string;
                calloutBadgeProps?: { text: string; color: string };
            };
        };
    } {
        return this.#getCached("guilded/settings/tabs");
    }

    // Overlays
    /**
     * Provides overlay portal.
     */
    get ["guilded/overlays/portal"]() {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/overlays/portal");
    }
    /**
     * Provides a container that displays a set of overlays.
     */
    get ["guilded/overlays/OverlayStack"]() {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/overlays/OverlayStack");
    }
    /**
     * Decorator for getting specific set of overlays.
     */
    get ["guilded/overlays/overlayProvider"](): { default: (overlays: string | string[]) => <T>(type: T) => T } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/overlays/overlayProvider");
    }

    // Context
    /**
     * Module with context of what channel client is looking at, channel messages, etc.
     */
    get ["guilded/context/chatContext"]() {
        return this.#getCachedWithPermissions(AddonPermission.UseApi, "guilded/context/chatContext");
    }
    /**
     * Provides layer context for Guilded portals.
     */
    get ["guilded/context/layerContext"]() {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/context/layerContext");
    }
    get ["guilded/context/teamContextProvider"](): { default: <T>(cls: T) => T } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/context/teamContextProvider");
    }
    get ["guilded/context/defaultContextProvider"](): { default: <T>(cls: T) => T } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/context/defaultContextProvider");
    }

    // Util
    /**
     * The utilities related to functions.
     */
    get ["guilded/util/functions"](): Function & { coroutine: <T extends Function>(fn: T) => any } {
        return this.#getCached("guilded/util/functions");
    }

    // Components
    get ["guilded/components/Form"](): { default: typeof Form } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/Form");
    }
    /**
     * The list of available field types in forms.
     */
    get ["guilded/components/formFieldTypes"](): { Dropdown: "Dropdown" } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/formFieldTypes");
    }
    /**
     * return this.#getCachedWithPermissions(Permissions.UseElements) &&s the class that contains a set of validators, which either return string (error message) or void.
     */
    get ["guilded/components/formValidations"](): {
        default: {
            ValidateUserUrl: (input: string) => string | undefined;
            validateIsUrl: (input: string) => string | undefined;
        };
    } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/formValidations");
    }

    /**
     * Provides a component that displays Markdown plain text.
     */
    get ["guilded/components/MarkdownRenderer"](): { default: typeof _React.Component } {
        //typeof React.Component<{ plainText: string, grammar: PrismGrammar }, {}>
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/MarkdownRenderer");
    }
    /**
     * A badge or a flair for anything.
     */
    get ["guilded/components/CalloutBadge"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/CalloutBadge");
    }
    get ["guilded/components/GuildedText"](): { default: typeof GuildedText } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/GuildedText");
    }
    /**
     * A clickable hyperlink component.
     */
    get ["guilded/components/RouteLink"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/RouteLink");
    }
    /**
     * A clickable Guilded button.
     */
    get ["guilded/components/Button"](): { default: typeof Button } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/Button");
    }
    get ["guilded/components/SvgIcon"](): { default: typeof SvgIcon } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/SvgIcon");
    }
    /**
     * Provides a null-state screen component.
     */
    get ["guilded/components/NullState"](): { default: typeof NullState } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/NullState");
    }
    /**
     * The component that creates horizontal selectable content tabs.
     */
    get ["guilded/components/HorizontalTabs"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/HorizontalTabs");
    }
    get ["guilded/components/ToggleField"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/ToggleField");
    }
    /**
     * Provides a simple Guilded toggle with optional label.
     */
    get ["guilded/components/SimpleToggle"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/SimpleToggle");
    }
    /**
     * Renderable chat image.
     */
    get ["guilded/components/MediaRenderer"](): { default: typeof MediaRenderer } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/MediaRenderer");
    }
    /**
     * Code block that can highlight code, have a header and can allow copying its contents.
     */
    get ["guilded/components/CodeContainer"](): { default: typeof CodeContainer } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/CodeContainer");
    }
    /**
     * An input made for searching.
     */
    get ["guilded/components/SearchBar"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/SearchBar");
    }
    /**
     * Returns a searchable table with filtering and other features.
     */
    get ["guilded/components/ItemManager"](): { default: typeof ItemManager } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/ItemManager");
    }
    /**
     * Returns an overflow button component that opens a menu.
     */
    get ["guilded/components/OverflowButton"](): { default: typeof OverflowButton } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/OverflowButton");
    }
    get ["guilded/components/BannerWithButton"](): { default: typeof BannerWithButton } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/BannerWithButton");
    }
    /**
     * Component that renders user's name, profile picture, badges and other things in a line.
     */
    get ["guilded/components/UserBasicInfo"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/UserBasicInfo");
    }
    /**
     * Profile picture of someone.
     */
    get ["guilded/components/ProfilePicture"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/ProfilePicture");
    }
    /**
     * The list of items that can overflow in certain direction and can be scrolled.
     */
    get ["guilded/components/CarouselList"](): { default: typeof CarouselList } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/CarouselList");
    }
    /**
     * Displays loading dots that takes up the whole page.
     */
    get ["guilded/components/LoadingPage"](): { default: typeof _React.Component } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/LoadingPage");
    }
    /**
     * Static image that fades into background.
     */
    get ["guilded/components/StretchFadeBackground"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/StretchFadeBackground");
    }
    /**
     * Divider that separates content with a line and a text in the middle.
     */
    get ["guilded/components/WordDividerLine"](): { default: typeof WordDividerLine } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/component/WordDividerLine");
    }
    /**
     * Draggable element names and infos.
     */
    get ["guilded/components/draggable"]() {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/draggable");
    }
    /**
     * Provides action menu component for rendering Guilded right click, overflow and other kinds of menus.
     */
    get ["guilded/components/ActionMenu"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/ActionMenu");
    }
    /**
     * Provides an action menu section that categorizes menu items.
     */
    get ["guilded/components/ActionMenuSection"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/ActionMenuSection");
    }
    /**
     * Provides a component for action menu button/item.
     */
    get ["guilded/components/ActionMenuItem"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/ActionMenuItem");
    }
    /**
     * Provides a component to render a Modal. Does not provide full Modal overlay.
     */
    get ["guilded/components/Modal"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/Modal");
    }
    get ["guilded/components/MarkRenderer"](): { default } {
        return this.#getCachedWithPermissions(AddonPermission.UseElements, "guilded/components/MarkRenderer");
    }
}
export function getApiCachedProperty(name: string, webpackManager: WebpackManager) {
    // If cached object exists, get it. Else, add it to cached array,
    // cache it and return cached value.
    return ~AddonApi._cachedList.indexOf(name)
        ? AddonApi._cached[name]
        : // Honestly, the only convenient thing about JS
          (AddonApi._cachedList.push(name),
          (AddonApi._cached[name] = cacheFns[name](webpackManager)) ?? AddonApi._moduleNotFound);
}
