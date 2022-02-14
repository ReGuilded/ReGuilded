import { AnyMessageObject, MessageContent } from "./rich-text";
import { MenuSpecs } from "./menu";
import { Editor } from "slate";
import { Size } from "./common";
import React, { ReactElement } from "react";
import { SvgIcon } from "./components/content";

export type NodeType = "block" | "inline" | "text" | "leaf" | "mark" | "renderless" | "command";
export type EditorTypes = "default" | "simple" | "reaction" | "bare";
export declare interface GuildedEditor extends Editor {
    value: MessageContent;
}
export type PluginSchema = {
    /**
     * Whether it does not hold any children.
     */
    isVoid?: boolean;
    /**
     * Matches whether the data is correct.
     */
    data?: (data: Object) => boolean | { [dataKey: string]: (value: any) => boolean };
    /**
     * Nodes matching schema.
     */
    nodes?: Array<{ match?: Partial<AnyMessageObject>[]; min?: number; max?: number }>;
    /**
     * Marks matching schema.
     */
    marks?: any[];
    /**
     * Matches whether the text is correct.
     */
    text: (text: string) => boolean;
};
export declare interface EditorPlugin {
    pluginType: NodeType;
    /**
     * The schema for matching node's content.
     */
    schema: PluginSchema;
    editorTypes: EditorTypes;
    type: string;
    toolbarInfo?: {
        /**
         * The group to put this formatting in editor's toolbar.
         */
        iconGroup?: "formatting";
        iconName?: string;
        iconComponent?: typeof SvgIcon | typeof React.Component;
        onClick?: (event: { editor: GuildedEditor; overlays: any[] }) => any;
        showOnSelection?: boolean;
        tooltip?: string;
        menu?: {
            size: Size;
            menuSpecs: MenuSpecs;
        };
    };
    commands?: {
        [name: string]: (editor: GuildedEditor, args: any) => void;
    };
    queries?: {
        [name: string]: (editor: GuildedEditor) => any;
    };
    renderNode?: (...args: any[]) => ReactElement | ReactElement;
    normalizeNode?: (node: AnyMessageObject, ...args: any[]) => any;
    renderer?: typeof React.Component;
    rendereredPlugin?: typeof React.Component;
}
