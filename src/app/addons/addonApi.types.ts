//#region import * from "*";
import * as PrismComponents from "prismjs/components";
import * as ReactDOM from "react-dom";
import * as Prism from "prismjs";
import * as React from "react";
import { Form, FormOutput, FormSpecs } from "../guilded/form";
import {
    BannerWithButton,
    CodeContainer,
    GuildedText,
    ItemManager,
    MediaRenderer,
    NullState,
    SvgIcon,
    WordDividerLine
} from "../guilded/components/content";
import { Button } from "../guilded/input";
import { OverflowButton } from "../guilded/menu";
import { Carousel as CarouselList } from "../guilded/components/sections";
import { getReactInstance, patchElementRenderer, waitForElement } from "./lib";
import { ModalProps } from "../guilded/components/modals";
import { EditorPlugin, NodeType } from "../guilded/slate";
//#endregion

//#region OverlayProvider, decorators & type mixins
type Decorator = <T>(type: T) => T;

export type DefinedOverlay<A, R> = {
    Open: (args: A) => Promise<R>;
};
export type ProvidedOverlay<T> = T extends "SimpleFormOverlay"
    ? DefinedOverlay<ModalProps & { formSpecs: FormSpecs }, FormOutput & { confirmed: boolean }>
    : T extends "DeleteConfirmationOverlay"
    ? DefinedOverlay<{ name: string }, { confirmed: boolean }>
    : T extends "SimpleConfirmationOverlay"
    ? DefinedOverlay<ModalProps & { text: string }, { confirmed: boolean }>
    : never;
export type OverlayProviderContent<T extends string> = { [O in T]: ProvidedOverlay<O> };
//#endregion

//#region AddonApiExports
export type AddonApiExports<N extends string> = N extends "transientMenuPortal"
    ? any
    : // React
    N extends "react"
    ? typeof React
    : N extends "react-dom"
    ? typeof ReactDOM
    : N extends "react-element"
    ? any
    : // HTTPs and WS
    N extends "guilded/http/rest"
    ? any
    : // Teams / Servers
    N extends "guilded/teams/games"
    ? any
    : N extends "guilded/teams/TeamModel"
    ? { default: typeof Object }
    : // Users / Members
    N extends "guilded/users/badges"
    ? any
    : N extends "guilded/users/flairs/displayInfo"
    ? any
    : N extends "guilded/users/flairs/tooltipInfo"
    ? any
    : N extends "guilded/users"
    ? { UserModel: typeof Object }
    : N extends "guilded/users/members"
    ? { MemberModel: typeof Object; getMemberModel: (memberInfo: { teamId: string; memberId: string }) => Object }
    : N extends "guilded/profile/PostModel"
    ? any
    : N extends "guilded/profile/SocialLinks"
    ? any
    : // Roles
    N extends "guilded/roles/membership"
    ? any
    : // Groups
    N extends "guilded/groups"
    ? { GroupModel: typeof Object }
    : // Channels
    N extends "guilded/channels"
    ? { ChannelModel: typeof Object }
    : N extends "guilded/channels/types"
    ? any
    : N extends "guilded/channels/management"
    ? any
    : N extends "guilded/channels/settings"
    ? any
    : N extends "guilded/channels/content/AnnouncementModel"
    ? { default: typeof Object }
    : N extends "guilded/channels/content/DocumentModel"
    ? { default: typeof Object }
    : N extends "guilded/channels/content/EventModel"
    ? { default: typeof Object }
    : N extends "guilded/channels/content/ListItemModel"
    ? { default: typeof Object }
    : N extends "guilded/channels/content/MessageModel"
    ? { default: typeof Object }
    : N extends "guilded/channels/content/eventInfo"
    ? any
    : // URLs
    N extends "guilded/urls/articles"
    ? any
    : N extends "guilded/urls/domain"
    ? any
    : N extends "guilded/urls/externalSites"
    ? any
    : N extends "guilded/urls/externalSiteInfo"
    ? any
    : N extends "guilded/urls/socialMedia"
    ? {
          SocialMediaTypes: { [socialMediaName: string]: string };
          default: { [socialMediaName: string]: { label: string; icon: string; href?: string } };
      }
    : // Editors and Markdown
    N extends "prism"
    ? typeof Prism
    : N extends "prism/components"
    ? typeof PrismComponents
    : N extends "guilded/editor/nodes"
    ? any
    : N extends "guilded/editor/nodeInfos"
    ? {
          EditorPluginsByEditorType: { [pluginType in NodeType]: EditorPlugin[] };
          InsertPlugins: EditorPlugin[];
          default: EditorPlugin[];
      }
    : N extends "guilded/editor/grammars"
    ? { default: { WebhookEmbed: Prism.Grammar } }
    : N extends "guilded/editor/languageCodes"
    ? { default: { [languageId: string]: string } }
    : // App
    N extends "guilded/app/sounds"
    ? any
    : // Settings
    N extends "guilded/settings/savableSettings"
    ? { default: Decorator }
    : N extends "guilded/settings/tabs"
    ? {
          [tabName: string]: {
              id: string;
              label: string;
              calloutBadgeProps?: { text: string; color: string };
          };
      }
    : // Overlays
    N extends "guilded/overlays/portal"
    ? any
    : N extends "guilded/overlays/OverlayStack"
    ? any
    : N extends "guilded/overlays/overlayProvider"
    ? { default: <O extends string>(overlays: O[]) => Decorator }
    : // Context
    N extends "guilded/context/chatContext"
    ? any
    : N extends "guilded/context/layerContext"
    ? any
    : N extends "guilded/context/teamContextProvider"
    ? { default: Decorator }
    : N extends "guilded/context/defaultContextProvider"
    ? { default: Decorator }
    : // Util
    N extends "guilded/util/functions"
    ? Function & { coroutine: <R, T extends (...args: any[]) => R>(fn: T) => (...args: any[]) => Promise<R> }
    : // Components
    N extends "guilded/components/Form"
    ? { default: typeof Form }
    : N extends "guilded/components/formFieldTypes"
    ? { default: { Dropdown: "Dropdown" } }
    : N extends "guilded/components/formValidations"
    ? {
          default: {
              ValidateUserUrl: (input: string) => string | undefined;
              validateIsUrl: (input: string) => string | undefined;
          };
      }
    : N extends "guilded/components/MarkdownRenderer"
    ? { default: typeof React.Component }
    : N extends "guilded/components/CalloutBadge"
    ? { default: typeof React.Component }
    : N extends "guilded/components/GuildedText"
    ? { default: typeof GuildedText }
    : N extends "guilded/components/RouteLink"
    ? { default: typeof React.Component }
    : N extends "guilded/components/Button"
    ? { default: typeof Button }
    : N extends "guilded/components/SvgIcon"
    ? { default: typeof SvgIcon }
    : N extends "guilded/components/NullState"
    ? { default: typeof NullState }
    : N extends "guilded/components/HorizontalTabs"
    ? { default: typeof React.Component }
    : N extends "guilded/components/ToggleField"
    ? { default: typeof React.Component }
    : N extends "guilded/components/SimpleToggle"
    ? { default: typeof React.Component }
    : N extends "guilded/components/MediaRenderer"
    ? { default: typeof MediaRenderer }
    : N extends "guilded/components/CodeContainer"
    ? { default: typeof CodeContainer }
    : N extends "guilded/components/SearchBar"
    ? { default: typeof React.Component }
    : N extends "guilded/components/ItemManager"
    ? { default: typeof ItemManager }
    : N extends "guilded/components/OverflowButton"
    ? { default: typeof OverflowButton }
    : N extends "guilded/components/BannerWithButton"
    ? { default: typeof BannerWithButton }
    : N extends "guilded/components/UserBasicInfo"
    ? { default: typeof React.Component }
    : N extends "guilded/components/ProfilePicture"
    ? { default: typeof React.Component }
    : N extends "guilded/components/CarouselList"
    ? { default: typeof CarouselList }
    : N extends "guilded/components/LoadingPage"
    ? { default: typeof React.Component }
    : N extends "guilded/components/StretchFadeBackground"
    ? { default: typeof React.Component }
    : N extends "guilded/components/WordDividerLine"
    ? { default: typeof WordDividerLine }
    : N extends "guilded/components/draggable"
    ? any
    : N extends "guilded/components/ActionMenu"
    ? { default: typeof React.Component }
    : N extends "guilded/components/ActionMenuSection"
    ? { default: typeof React.Component }
    : N extends "guilded/components/ActionMenuItem"
    ? { default: typeof React.Component }
    : N extends "guilded/components/Modal"
    ? { default: typeof React.Component }
    : N extends "guilded/components/MarkRenderer"
    ? { default: typeof React.Component }
    : unknown;
//#endregion
