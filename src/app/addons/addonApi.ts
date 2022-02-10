import { getReactInstance, patchElementRenderer, waitForElement } from "./lib";
import AddonHandler, { AddonPermission } from "../core/handlers/addon";
import { AddonApiExports } from "./addonApi.types";
import { MenuSectionSpecs } from "../guilded/menu";
import { EditorPlugin } from "../guilded/slate";
import WebpackManager from "./webpack";

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
    transientMenuPortal: _ => getReactInstance(document.querySelector(".TransientMenuPortalContext-portal-container")),

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
    "guilded/components/HorizontalTab": webpack => webpack.withClassProperty("tabOption"),
    "guilded/components/ToggleFieldWrapper": webpack => webpack.withCode("ToggleFieldWrapper-container"),
    "guilded/components/SimpleToggle": webpack => webpack.withClassProperty("input"),
    "guilded/components/MediaRenderer": webpack => webpack.withClassProperty("progressiveImageHasLoaded"),
    "guilded/components/CodeContainer": webpack => webpack.withClassProperty("tokenCodeLines"),
    "guilded/components/SearchBarV2": webpack => webpack.withClassProperty("_inputRef"),
    "guilded/components/GuildedSelect": webpack => webpack.withClassProperty("selectedValue"),
    "guilded/components/ItemManager": webpack => webpack.withCode("ItemManager"),
    "guilded/components/OverflowButton": webpack => webpack.withClassProperty("isOpen"),
    "guilded/components/BannerWithButton": webpack => webpack.withClassProperty("hasText"),
    "guilded/components/IconAndLabel": webpack => webpack.withCode("IconAndLabel"),
    "guilded/components/UserBasicInfoDisplay": webpack => webpack.withClassProperty("userPresenceContext"),
    "guilded/components/CheckmarkIcon": webpack => webpack.withCode("CheckmarkIcon"),
    "guilded/components/ProfilePicture": webpack => webpack.withClassProperty("borderType"),
    "guilded/components/CarouselList": webpack => webpack.withClassProperty("overflowRight"),
    "guilded/components/LoadingAnimationMicro": webpack => webpack.withClassProperty("containerStyle"),
    "guilded/components/LoadingPage": webpack => webpack.withCode("LoadingPage"),
    "guilded/components/BadgeV2": webpack => webpack.withCode("BadgeV2"),
    "guilded/components/WordDividerLine": webpack => webpack.withCode("WordDividerLine"),
    "guilded/components/StretchFadeBackground": webpack => webpack.withCode("StretchFadeBackground"),
    "guilded/components/TeamNavSectionItem": webpack => webpack.withCode("TeamNavSectionItem"),
    "guilded/components/TeamNavSectionsList": webpack => webpack.withClassProperty("isSomeActionSelected"),
    "guilded/components/ThreeColumns": webpack => webpack.withCode("ThreeColumns"),
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
    static reguildedUtil = {
        getReactInstance,
        waitForElement
    };
    static reguildedPatchUtil = {
        patchElementRenderer
    };

    // Don't allow addons to fetch this with `require("webpackManager")`
    #webpackManager: WebpackManager;
    #addonManager: AddonHandler;
    #addonId: string;
    #reguildedSlateUtil: {};

    // If addon needs it
    constructor(webpackManager: WebpackManager, addonManager: AddonHandler, addonId: string) {
        this.#webpackManager = webpackManager;
        this.#addonManager = addonManager;
        this.#addonId = addonId;
        this.#reguildedSlateUtil = {
            defaultInsertPlugins: { media: 0, form: 1 },
            addInsertPlugin: (plugin: EditorPlugin) => this["guilded/editor/nodeInfos"].InsertPlugins.push(plugin),
            removeInsertPlugin: (pluginIndex: number) =>
                this["guilded/editor/nodeInfos"].InsertPlugins.splice(pluginIndex, 1),
            addSlateSection: (section: MenuSectionSpecs) => {
                const inserts = document.getElementsByClassName("SlateInsertToolbar-container");

                for (const insert of inserts) {
                    const insertReact = getReactInstance(insert);
                    if (insertReact) insertReact.props.menuSpecs.sections.push(section);
                }
            },
            removeSlateSection: (sectionName: string) => {
                const inserts = document.getElementsByClassName("SlateInsertToolbar-container");

                for (const insert of inserts) {
                    const insertReact = getReactInstance(insert);

                    // To prevent errors
                    if (insertReact) {
                        const { sections }: { sections: MenuSectionSpecs[] } = insertReact.props.menuSpecs;

                        // Remove by name
                        sections.splice(
                            sections.findIndex(section => section.name === sectionName),
                            1
                        );
                    }
                }
            },
            getPluginByType: (type: string) =>
                this["guilded/editor/nodeInfos"].default.find(plugin => plugin.type === type)
        };
    }
    /**
     * Caches the value if it's not already cached and returns it.
     * @param name The name of cachable value
     * @returns The cached value
     */
    #getCached(name: string): any {
        return AddonApi.getApiCachedProperty(name, this.#webpackManager);
    }
    /**
     * Caches the value if it's not already cached and returns it. Requires specified permissions.
     * @param permissions The permissions that it requires
     * @param name The name of cachable value
     * @returns The cached value
     */
    #getCachedWithPermissions(permissions: AddonPermission, name: string) {
        return this.#hasPermission(permissions) && this.#getCached(name);
    }
    /**
     * Gets whether there is the specified permission.
     * @param permission The permission that is needed
     * @returns Permission or 0
     */
    #hasPermission(permission: AddonPermission) {
        return this.#addonManager.hasAnyPermission(this.#addonId, permission);
    }
    #hasAllPermissions(permissions: AddonPermission) {
        return this.#addonManager.hasAllPermissions(this.#addonId, permissions);
    }

    // ReGuilded
    get ["guilded/reguilded-util/patch"]() {
        return this.#hasPermission(AddonPermission.Elements) && AddonApi.reguildedPatchUtil;
    }
    get ["guilded/reguilded-util/react"]() {
        return this.#hasPermission(AddonPermission.Elements) && AddonApi.reguildedUtil;
    }
    get ["guilded/reguilded-util/editor"]() {
        return this.#hasPermission(AddonPermission.Elements) && this.#reguildedSlateUtil;
    }

    // React
    /**
     * React.JS framework stuff.
     */
    get react(): AddonApiExports<"react"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "react");
    }
    /**
     * React.JS framework DOM-related things.
     */
    get ["react-dom"](): AddonApiExports<"react-dom"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "react-dom");
    }
    /**
     * Method for creating React elements.
     */
    get ["react-element"]() {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "react-element");
    }

    // HTTPS and WS
    /**
     * The list of REST methods for interacting with Guilded API.
     */
    get ["guilded/http/rest"](): AddonApiExports<"guilded/http/rest"> {
        return this.#getCachedWithPermissions(AddonPermission.UseApi, "guilded/http/rest");
    }

    // Teams / Servers
    /**
     * The list of supported games.
     */
    get ["guilded/teams/games"](): AddonApiExports<"guilded/teams/games"> {
        return this.#getCached("guilded/teams/games");
    }
    /**
     * Model class for teams.
     */
    get ["guilded/teams/TeamModel"](): AddonApiExports<"guilded/teams/TeamModel"> {
        return this.#getCached("guilded/teams/TeamModel");
    }

    // Users / Members
    /**
     * The list of all global badges.
     */
    get ["guilded/users/badges"](): AddonApiExports<"guilded/users/badges"> {
        return this.#getCached("guilded/users/badges");
    }
    /**
     * The list of all global flairs display info.
     */
    get ["guilded/users/flairs/displayInfo"](): AddonApiExports<"guilded/users/flairs/displayInfo"> {
        return this.#getCached("guilded/users/flairs/displayInfo");
    }
    /**
     * The list of all global flairs tooltip info.
     */
    get ["guilded/users/flairs/tooltipInfo"](): AddonApiExports<"guilded/users/flairs/tooltipInfo"> {
        return this.#getCached("guilded/users/flairs/tooltipInfo");
    }
    /**
     * Model class for users.
     */
    get ["guilded/users"](): AddonApiExports<"guilded/users"> {
        return this.#getCached("guilded/users");
    }
    /**
     * Fetches a model for the given member.
     */
    get ["guilded/users/members"](): AddonApiExports<"guilded/users/members"> {
        return this.#getCachedWithPermissions(AddonPermission.ExtraInfo, "guilded/users/members");
    }
    /**
     * Model class for users' profile posts.
     */
    get ["guilded/profile/PostModel"](): AddonApiExports<"guilded/profile/PostModel"> {
        return this.#getCached("guilded/profile/PostModel");
    }
    /**
     * The list of social links that can be put under profile.
     */
    get ["guilded/profile/socialLinks"](): AddonApiExports<"guilded/profile/socialLinks"> {
        return this.#getCached("guilded/profile/socialLinks");
    }

    // Roles
    /**
     * Captain, former member, admin, etc. infos and names.
     */
    get ["guilded/roles/membership"](): AddonApiExports<"guilded/roles/membership"> {
        return this.#getCached("guilded/roles/membership");
    }

    // Groups
    /**
     * Model class for groups.
     */
    get ["guilded/groups"](): AddonApiExports<"guilded/groups"> {
        return this.#getCached("guilded/groups");
    }

    // Channels
    /**
     * Model class for channels.
     */
    get ["guilded/channels"](): AddonApiExports<"guilded/channels"> {
        return this.#getCached("guilded/channels");
    }
    /**
     * The list of all channel and section types.
     */
    get ["guilded/channels/types"](): AddonApiExports<"guilded/channels/types"> {
        return this.#getCached("guilded/channels/types");
    }
    /**
     * Methods related to channel management.
     */
    get ["guilded/channels/management"](): AddonApiExports<"guilded/channels/management"> {
        return this.#getCachedWithPermissions(AddonPermission.ExtraInfo, "guilded/channels/management");
    }
    /**
     * The lengths of channel names, IDs and other things related to channel settings.
     */
    get ["guilded/channels/settings"](): AddonApiExports<"guilded/channels/settings"> {
        return this.#getCached("guilded/channels/settings");
    }
    /**
     * Model class for announcement posts.
     */
    get ["guilded/channels/content/AnnouncementModel"](): AddonApiExports<"guilded/channels/content/AnnouncementModel"> {
        return this.#getCached("guilded/channels/content/AnnouncementModel");
    }
    /**
     * Model class for document channel documents.
     */
    get ["guilded/channels/content/DocumentModel"](): AddonApiExports<"guilded/channels/content/DocumentModel"> {
        return this.#getCached("guilded/channels/content/DocumentModel");
    }
    /**
     * Model class for calendar events.
     */
    get ["guilded/channels/content/EventModel"](): AddonApiExports<"guilded/channels/content/EventModel"> {
        return this.#getCached("guilded/channels/content/EventModel");
    }
    /**
     * Model class for list channel items/tasks.
     */
    get ["guilded/channels/content/ListItemModel"](): AddonApiExports<"guilded/channels/content/ListItemModel"> {
        return this.#getCached("guilded/channels/content/ListItemModel");
    }
    /**
     * Model class for chat messages.
     */
    get ["guilded/channels/content/MessageModel"](): AddonApiExports<"guilded/channels/content/MessageModel"> {
        return this.#getCached("guilded/channels/content/MessageModel");
    }
    /**
     * Gets event configuration limitations.
     */
    get ["guilded/channels/content/eventInfo"](): AddonApiExports<"guilded/channels/content/eventInfo"> {
        return this.#getCached("guilded/channels/content/eventInfo");
    }

    // URLs
    /**
     * Links to various Guilded help-center articles.
     */
    get ["guilded/urls/articles"](): AddonApiExports<"guilded/urls/articles"> {
        return this.#getCached("guilded/urls/articles");
    }
    /**
     * Links and information about guilded.gg domain.
     */
    get ["guilded/urls/domain"](): AddonApiExports<"guilded/urls/domain"> {
        return this.#getCached("guilded/urls/domain");
    }
    /**
     * The list of all external sites Guilded embeds support.
     */
    get ["guilded/urls/externalSites"](): AddonApiExports<"guilded/urls/externalSites"> {
        return this.#getCached("guilded/urls/externalSites");
    }
    /**
     * Information about external sites Guilded embeds support, such as colours and icons.
     */
    get ["guilded/urls/externalSiteInfos"](): AddonApiExports<"guilded/urls/externalSiteInfos"> {
        return this.#getCached("guilded/urls/externalSiteInfos");
    }
    /**
     * All of the social medias that Guilded client recognizes.
     */
    get ["guilded/urls/socialMedia"](): AddonApiExports<"guilded/urls/socialMedia"> {
        return this.#getCached("guilded/urls/socialMedia");
    }

    // Editors and Markdown
    /**
     * Gets Prism library.
     */
    get prism(): AddonApiExports<"prism"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "prism");
    }
    /**
     * Gets the plugins and language settings of Prism.js.
     */
    get ["prism/components"](): AddonApiExports<"prism/components"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "prism/info")?.prismComponents;
    }
    // /**
    //  * The list of all Slate nodes.
    //  */
    // get ["guilded/editor/nodes"](): AddonApiExports<"guilded/editor/nodes"> {
    //     return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/editor/nodes");
    // }
    /**
     * The list of nodes sorted by reactions, bare, etc.
     */
    get ["guilded/editor/nodeInfos"](): AddonApiExports<"guilded/editor/nodeInfos"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/editor/nodeInfos");
    }
    /**
     * A dictionary of Markdown grammars.
     */
    get ["guilded/editor/grammars"](): AddonApiExports<"guilded/editor/grammars"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/editor/grammars");
    }
    /**
     * The list of language identifiers and their display names.
     */
    get ["guilded/editor/languageCodes"](): AddonApiExports<"guilded/editor/languageCodes"> {
        return this.#getCached("guilded/editor/languageCodes");
    }

    // App
    /**
     * The list of all client sounds.
     */
    get ["guilded/app/sounds"](): AddonApiExports<"guilded/app/sounds"> {
        return this.#getCachedWithPermissions(AddonPermission.ExtraInfo, "guilded/app/sounds");
    }

    // Settings
    get ["guilded/settings/savableSettings"](): AddonApiExports<"guilded/settings/savableSettings"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/settings/savableSettings");
    }
    /**
     * The list of settings tabs.
     */
    get ["guilded/settings/tabs"](): AddonApiExports<"guilded/settings/tabs"> {
        return this.#getCached("guilded/settings/tabs");
    }

    // Overlays
    /**
     * Provides overlay portal.
     */
    get ["guilded/overlays/portal"](): AddonApiExports<"guilded/overlays/portal"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/overlays/portal");
    }
    /**
     * Provides a container that displays a set of overlays.
     */
    get ["guilded/overlays/OverlayStack"](): AddonApiExports<"guilded/overlays/OverlayStack"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/overlays/OverlayStack");
    }
    /**
     * Decorator for getting specific set of overlays.
     */
    get ["guilded/overlays/overlayProvider"](): AddonApiExports<"guilded/overlays/overlayProvider"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/overlays/overlayProvider");
    }

    // Context
    /**
     * Module with context of what channel client is looking at, channel messages, etc.
     */
    get ["guilded/context/chatContext"](): AddonApiExports<"guilded/context/chatContext"> {
        return this.#getCachedWithPermissions(AddonPermission.UseApi, "guilded/context/chatContext");
    }
    /**
     * Provides layer context for Guilded portals.
     */
    get ["guilded/context/layerContext"](): AddonApiExports<"guilded/context/layerContext"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/context/layerContext");
    }
    get ["guilded/context/teamContextProvider"](): AddonApiExports<"guilded/context/teamContextProvider"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/context/teamContextProvider");
    }
    get ["guilded/context/defaultContextProvider"](): AddonApiExports<"guilded/context/defaultContextProvider"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/context/defaultContextProvider");
    }

    // Util
    /**
     * The utilities related to functions.
     */
    get ["guilded/util/functions"](): AddonApiExports<"guilded/util/functions"> {
        return this.#getCached("guilded/util/functions");
    }

    // Components
    get ["guilded/components/Form"](): AddonApiExports<"guilded/components/Form"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/Form");
    }
    /**
     * The list of available field types in forms.
     */
    get ["guilded/components/formFieldTypes"](): AddonApiExports<"guilded/components/formFieldTypes"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/formFieldTypes");
    }
    /**
     * return this.#getCachedWithPermissions(Permissions.UseElements) &&s the class that contains a set of validators, which either return string (error message) or void.
     */
    get ["guilded/components/formValidations"](): AddonApiExports<"guilded/components/formValidations"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/formValidations");
    }

    /**
     * Provides a component that displays Markdown plain text.
     */
    get ["guilded/components/MarkdownRenderer"](): AddonApiExports<"guilded/components/MarkdownRenderer"> {
        //typeof React.Component<{ plainText: string, grammar: PrismGrammar }, {}>
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/MarkdownRenderer");
    }
    /**
     * A badge or a flair for anything.
     */
    get ["guilded/components/CalloutBadge"](): AddonApiExports<"guilded/components/CalloutBadge"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/CalloutBadge");
    }
    get ["guilded/components/GuildedText"](): AddonApiExports<"guilded/components/GuildedText"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/GuildedText");
    }
    /**
     * A clickable hyperlink component.
     */
    get ["guilded/components/RouteLink"](): AddonApiExports<"guilded/components/RouteLink"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/RouteLink");
    }
    /**
     * A clickable Guilded button.
     */
    get ["guilded/components/Button"](): AddonApiExports<"guilded/components/Button"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/Button");
    }
    get ["guilded/components/SvgIcon"](): AddonApiExports<"guilded/components/SvgIcon"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/SvgIcon");
    }
    /**
     * Provides a null-state screen component.
     */
    get ["guilded/components/NullState"](): AddonApiExports<"guilded/components/NullState"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/NullState");
    }
    /**
     * The component that creates horizontal selectable content tabs.
     */
    get ["guilded/components/HorizontalTabs"](): AddonApiExports<"guilded/components/HorizontalTabs"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/HorizontalTabs");
    }
    /**
     * Single displayed tab in the HorizontalTabs header.
     */
    get ["guilded/components/HorizontalTab"](): AddonApiExports<"guilded/components/HorizontalTab"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/HorizontalTabs");
    }
    get ["guilded/components/ToggleFieldWrapper"](): AddonApiExports<"guilded/components/ToggleFieldWrapper"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/ToggleFieldWrapper");
    }
    /**
     * Provides a simple Guilded toggle with optional label.
     */
    get ["guilded/components/SimpleToggle"](): AddonApiExports<"guilded/components/SimpleToggle"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/SimpleToggle");
    }
    /**
     * Renderable chat image.
     */
    get ["guilded/components/MediaRenderer"](): AddonApiExports<"guilded/components/MediaRenderer"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/MediaRenderer");
    }
    /**
     * Code block that can highlight code, have a header and can allow copying its contents.
     */
    get ["guilded/components/CodeContainer"](): AddonApiExports<"guilded/components/CodeContainer"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/CodeContainer");
    }
    /**
     * An input made for searching.
     */
    get ["guilded/components/SearchBarV2"](): AddonApiExports<"guilded/components/SearchBarV2"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/SearchBarV2");
    }
    /**
     * Returns a searchable table with filtering and other features.
     */
    get ["guilded/components/ItemManager"](): AddonApiExports<"guilded/components/ItemManager"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/ItemManager");
    }
    /**
     * Returns an overflow button component that opens a menu.
     */
    get ["guilded/components/OverflowButton"](): AddonApiExports<"guilded/components/OverflowButton"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/OverflowButton");
    }
    get ["guilded/components/BannerWithButton"](): AddonApiExports<"guilded/components/BannerWithButton"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/BannerWithButton");
    }
    get ["guilded/components/IconAndLabel"](): AddonApiExports<"guilded/components/IconAndLabel"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/IconAndLabel");
    }
    /**
     * Component that renders user's name, profile picture, badges and other things in a line.
     */
    get ["guilded/components/UserBasicInfoDisplay"](): AddonApiExports<"guilded/components/UserBasicInfoDisplay"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/UserBasicInfoDisplay");
    }
    /**
     * Profile picture of someone.
     */
    get ["guilded/components/ProfilePicture"](): AddonApiExports<"guilded/components/ProfilePicture"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/ProfilePicture");
    }
    /**
     * The list of items that can overflow in certain direction and can be scrolled.
     */
    get ["guilded/components/CarouselList"](): AddonApiExports<"guilded/components/CarouselList"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/CarouselList");
    }
    /**
     * Displays loading dots that takes up the whole page.
     */
    get ["guilded/components/LoadingPage"](): AddonApiExports<"guilded/components/LoadingPage"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/LoadingPage");
    }
    /**
     * Displays loading animated dots.
     */
    get ["guilded/components/LoadingAnimationMicro"](): AddonApiExports<"guilded/components/LoadingAnimationMicro"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/LoadingAnimationMicro");
    }
    /**
     * Displays a red notification badge.
     */
    get ["guilded/components/BadgeV2"](): AddonApiExports<"guilded/components/BadgeV2"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/BadgeV2");
    }
    /**
     * Static image that fades into background.
     */
    get ["guilded/components/StretchFadeBackground"](): AddonApiExports<"guilded/components/StretchFadeBackground"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/StretchFadeBackground");
    }
    /**
     * Divider that separates content with a line and a text in the middle.
     */
    get ["guilded/components/WordDividerLine"](): AddonApiExports<"guilded/components/WordDividerLine"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/component/WordDividerLine");
    }
    get ["guilded/components/TeamNavSectionItem"](): AddonApiExports<"guilded/components/TeamNavSectionItem"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/TeamNavSectionItem");
    }
    get ["guilded/components/TeamNavSectionsList"](): AddonApiExports<"guilded/components/TeamNavSectionsList"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/TeamNavSectionsList");
    }
    /**
     * Displays three columns, where the middle one covers the left over space and side columns take up ~300px.
     */
    get ["guilded/components/ThreeColumns"](): AddonApiExports<"guilded/components/ThreeColumns"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/ThreeColumns");
    }
    /**
     * Draggable element names and infos.
     */
    get ["guilded/components/draggable"](): AddonApiExports<"guilded/components/draggable"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/draggable");
    }
    /**
     * Provides action menu component for rendering Guilded right click, overflow and other kinds of menus.
     */
    get ["guilded/components/ActionMenu"](): AddonApiExports<"guilded/components/ActionMenu"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/ActionMenu");
    }
    /**
     * Provides an action menu section that categorizes menu items.
     */
    get ["guilded/components/ActionMenuSection"](): AddonApiExports<"guilded/components/ActionMenuSection"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/ActionMenuSection");
    }
    /**
     * Provides a component for action menu button/item.
     */
    get ["guilded/components/ActionMenuItem"](): AddonApiExports<"guilded/components/ActionMenuItem"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/ActionMenuItem");
    }
    /**
     * Provides a component to render a Modal. Does not provide full Modal overlay.
     */
    get ["guilded/components/Modal"](): AddonApiExports<"guilded/components/Modal"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/Modal");
    }
    get ["guilded/components/MarkRenderer"](): AddonApiExports<"guilded/components/MarkRenderer"> {
        return this.#getCachedWithPermissions(AddonPermission.Elements, "guilded/components/MarkRenderer");
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
    static getApiCachedProperty<T extends string>(name: T, webpackManager: WebpackManager): AddonApiExports<T> {
        // If cached object exists, get it. Else, add it to cached array,
        // cache it and return cached value.
        return ~AddonApi._cachedList.indexOf(name)
            ? AddonApi._cached[name]
            : // Honestly, the only convenient thing about JS
              (AddonApi._cachedList.push(name),
              (AddonApi._cached[name] = cacheFns[name](webpackManager)) ?? AddonApi._moduleNotFound);
    }
}
