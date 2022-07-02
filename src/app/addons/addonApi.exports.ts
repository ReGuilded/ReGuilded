//#region import * from "*";
import * as PrismComponents from "prismjs/components";
import * as ReactDOM from "react-dom";
import * as Prism from "prismjs";
import * as React from "react";
import { Form } from "../guilded/form";
import {
    BadgeV2,
    BannerWithButton,
    CalloutBadge,
    CalloutBadgeProps,
    CalloutBadgeWithText,
    CheckboxV2,
    CheckmarkIcon,
    CodeContainer,
    GuildedText,
    IconAndLabel,
    ItemManager,
    LoadingAnimationMicro,
    NullState,
    SvgIcon,
    TabEmptyState,
    WordDividerLine
} from "../guilded/components/content";
import { GuildedImage, UserBasicInfoDisplay } from "../guilded/components/display";
import { Button, GuildedSelect, SearchBarV2, SimpleToggle } from "../guilded/components/input";
import { OverflowButton } from "../guilded/menu";
import { Carousel as CarouselList, DragViewer, HorizontalTab, HorizontalTabs, TeamNavSectionItem, TeamNavSectionsList, ThreeColumns } from "../guilded/components/sections";
import { ModalV2 } from "../guilded/components/modals";
import { EditorPlugin, NodeType } from "../guilded/slate";
import { UserModel } from "../guilded/models";
import { OverlayProvider, TypeMixin } from "../guilded/decorators";
import { BlogPage, ScreenHeader } from "../guilded/components/page";
import { RestMethods } from "../guilded/http";
import { FlairDefinition, FlairTooltipInfo } from "../guilded/badges";
import { PrismInfo } from "../guilded/rich-text";
import { UnknownFunction } from "../types/util";
//#endregion

//#region OverlayProvider, decorators & type mixins
type Decorator = <T>(type: T) => T;
//#endregion

//#region AddonApiExports
export type AddonApiExports<N extends string> = N extends "transientMenuPortal"
    ? unknown
    : // React
    N extends "react"
    ? typeof React
    : N extends "react-dom"
    ? typeof ReactDOM
    : N extends "react-element"
    ? unknown
    : // HTTPs and WS
    N extends "guilded/http/rest"
    ? { default: RestMethods }
    : // Teams / Servers
    N extends "guilded/teams/games"
    ? unknown
    : N extends "guilded/teams/TeamModel"
    ? { default: typeof Object }
    : // Users / Members
    N extends "guilded/users/badges"
    ? unknown
    : N extends "guilded/users/flairs/displayInfo"
    ? { default: Record<string, FlairDefinition> }
    : N extends "guilded/users/flairs/tooltipInfo"
    ? { default: Record<string, FlairTooltipInfo> }
    : N extends "guilded/users"
    ? { UserModel: typeof UserModel }
    : N extends "guilded/users/members"
    ? {
          MemberModel: typeof Object;
          getMemberModel: (memberInfo: { teamId: string; memberId: string }) => unknown;
      }
    : N extends "guilded/profile/PostModel"
    ? unknown
    : N extends "guilded/profile/SocialLinks"
    ? unknown
    : // Roles
    N extends "guilded/roles/membership"
    ? unknown
    : // Groups
    N extends "guilded/groups"
    ? { GroupModel: typeof Object }
    : // Channels
    N extends "guilded/channels"
    ? { ChannelModel: typeof Object }
    : N extends "guilded/channels/types"
    ? unknown
    : N extends "guilded/channels/management"
    ? unknown
    : N extends "guilded/channels/settings"
    ? unknown
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
    ? unknown
    : // URLs
    N extends "guilded/urls/articles"
    ? unknown
    : N extends "guilded/urls/domain"
    ? unknown
    : N extends "guilded/urls/externalSites"
    ? unknown
    : N extends "guilded/urls/externalSiteInfo"
    ? unknown
    : N extends "guilded/urls/socialMedia"
    ? {
          SocialMediaTypes: { [socialMediaName: string]: string };
          default: {
              [socialMediaName: string]: {
                  label: string;
                  icon: string;
                  href?: string;
              };
          };
      }
    : // Editors and Markdown
    N extends "prism"
    ? typeof Prism
    : N extends "prism/info"
    ? PrismInfo
    : N extends "prism/components"
    ? typeof PrismComponents
    : N extends "guilded/editor/nodes"
    ? unknown
    : N extends "guilded/editor/nodeInfos"
    ? {
          EditorPluginsByEditorType: {
              [pluginType in NodeType]: EditorPlugin[];
          };
          InsertPlugins: EditorPlugin[];
          default: EditorPlugin[];
      }
    : N extends "guilded/editor/grammars"
    ? { default: { WebhookEmbed: Prism.Grammar } }
    : N extends "guilded/editor/languageCodes"
    ? { default: { [languageId: string]: string } }
    : // App
    N extends "guilded/app/sounds"
    ? unknown
    : // Settings
    N extends "guilded/settings/savableSettings"
    ? {
          default: TypeMixin<{
              SaveChanges: UnknownFunction;
              _handleOptionsChange: () => void;
          }>;
      }
    : N extends "guilded/settings/tabs"
    ? {
          [tabName: string]: {
              id: string;
              label: string;
              calloutBadgeProps?: CalloutBadgeProps & { color?: string };
          };
      }
    : // Overlays
    N extends "guilded/overlays/portal"
    ? unknown
    : N extends "guilded/overlays/OverlayStack"
    ? unknown
    : N extends "guilded/overlays/overlayProvider"
    ? { default: OverlayProvider }
    : // Context
    N extends "guilded/context/chatContext"
    ? unknown
    : N extends "guilded/context/layerContext"
    ? unknown
    : N extends "guilded/context/teamContextProvider"
    ? { default: Decorator }
    : N extends "guilded/context/defaultContextProvider"
    ? { default: Decorator }
    : // Util
    N extends "guilded/util/functions"
    ? UnknownFunction & {
          coroutine: <R, T extends (...args: unknown[]) => R>(fn: T) => (...args: unknown[]) => Promise<R>;
      }
    : // Components
    N extends "guilded/components/cssLoader"
    ? {
          default: (prop: {
              name: string;
              loader: () => {
                  default: {
                      use: UnknownFunction;
                      unuse: UnknownFunction;
                      locals: { [colorName: string]: string };
                  };
              };
          }) => Decorator;
      }
    : N extends "guilded/components/cssDictionary"
    ? { default: { [componentName: string]: number } }
    : N extends "guilded/components/Form"
    ? { default: typeof Form }
    : N extends "guilded/components/formFieldTypes"
    ? {
          default: {
              Text: "Text";
              TextArea: "TextArea";
              RichText: "RichText";
              Switch: "Switch";
              TriState: "TriState";
              Radios: "Radios";
              IconMenu: "IconMenu";
              Button: "Button";
              DateAndTimeRange: "DateAndTimeRange";
              Date: "Date";
              Time: "Time";
              EventRepeat: "EventRepeat";
              Color: "Color";
              Range: "Range";
              ItemKeybinds: "ItemKeybinds";
              Hotkey: "Hotkey";
              Table: "Table";
              Checkboxes: "Checkboxes";
              Dropdown: "Dropdown";
              SearchableList: "SearchableList";
              CustomForm: "CustomForm";
              Image: "Image";
              Reaction: "Reaction";
              Tag: "Tag";
              Number: "Number";
          };
      }
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
    ? { default: typeof CalloutBadge }
    : N extends "guilded/components/GuildedText"
    ? { default: typeof GuildedText }
    : N extends "guilded/components/RouteLink"
    ? { default: typeof React.Component }
    : N extends "guilded/components/Button"
    ? { default: typeof Button }
    : N extends "guilded/components/SvgIcon"
    ? { default: typeof SvgIcon }
    : N extends "guilded/components/TabEmptyState"
    ? { default: typeof TabEmptyState }
    : N extends "guilded/components/NullState"
    ? { default: typeof NullState }
    : N extends "guilded/components/HorizontalTabs"
    ? { default: typeof HorizontalTabs }
    : N extends "guilded/components/HorizontalTab"
    ? { default: typeof HorizontalTab }
    : N extends "guilded/components/ToggleFieldWrapper"
    ? { default: typeof React.Component }
    : N extends "guilded/components/SimpleToggle"
    ? { default: typeof SimpleToggle }
    : N extends "guilded/components/Image"
    ? { default: typeof GuildedImage }
    : N extends "guilded/components/CodeContainer"
    ? { default: typeof CodeContainer }
    : N extends "guilded/components/SearchBarV2"
    ? { default: typeof SearchBarV2 }
    : N extends "guilded/components/CardWrapper"
    ? { default: typeof React.Component }
    : N extends "guilded/components/GuildedSelect"
    ? { default: typeof GuildedSelect }
    : N extends "guilded/components/ItemManager"
    ? { default: typeof ItemManager }
    : N extends "guilded/components/OverflowButton"
    ? { default: typeof OverflowButton }
    : N extends "guilded/components/BannerWithButton"
    ? { default: typeof BannerWithButton }
    : N extends "guilded/components/IconAndLabel"
    ? { default: typeof IconAndLabel }
    : N extends "guilded/components/UserBasicInfoDisplay"
    ? { default: typeof UserBasicInfoDisplay }
    : N extends "guilded/components/CheckboxV2"
    ? { default: typeof CheckboxV2 }
    : N extends "guilded/components/CheckmarkIcon"
    ? { default: typeof CheckmarkIcon }
    : N extends "guilded/components/ProfilePicture"
    ? { default: typeof React.Component }
    : N extends "guilded/components/CarouselList"
    ? { default: typeof CarouselList }
    : N extends "guilded/components/LoadingAnimationMicro"
    ? { default: typeof LoadingAnimationMicro }
    : N extends "guilded/components/LoadingPage"
    ? { default: typeof React.Component }
    : N extends "guilded/components/BadgeV2"
    ? { default: typeof BadgeV2 }
    : N extends "guilded/components/StretchFadeBackground"
    ? { default: typeof React.Component }
    : N extends "guilded/components/CalloutBadgeWithText"
    ? { default: typeof CalloutBadgeWithText }
    : N extends "guilded/components/WordDividerLine"
    ? { default: typeof WordDividerLine }
    : N extends "guilded/components/ScreenHeader"
    ? { default: typeof ScreenHeader }
    : N extends "guilded/components/TeamNavSectionItem"
    ? { default: typeof TeamNavSectionItem }
    : N extends "guilded/components/TeamNavSectionsList"
    ? { default: typeof TeamNavSectionsList }
    : N extends "guilded/components/ThreeColumns"
    ? { default: typeof ThreeColumns }
    : N extends "guilded/components/DragViewer"
    ? { default: typeof DragViewer }
    : N extends "guilded/components/ActionMenu"
    ? { default: typeof React.Component }
    : N extends "guilded/components/ActionMenuSection"
    ? { default: typeof React.Component }
    : N extends "guilded/components/ActionMenuItem"
    ? { default: typeof React.Component }
    : N extends "guilded/components/ModalV2"
    ? { default: typeof ModalV2 }
    : N extends "guilded/components/MarkRenderer"
    ? { default: typeof React.Component }
    : N extends "guilded/components/BlogPage"
    ? { default: typeof BlogPage }
    : N extends "guilded/components/draggable"
    ? unknown
    : unknown;
//#endregion
