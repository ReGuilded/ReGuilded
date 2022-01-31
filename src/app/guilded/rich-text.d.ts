export type TemplateParameterOptions = {
    /**
     * The identifier of the template parameter it is.
     * @example "BotActionTriggeringUser"
     */
    id: string;
    type: "template-parameter";
    /**
     * The text that acts like alt text of the template parameter.
     * @example "$triggeringuser"
     */
    matcher: string;
    /**
     * The displayed name of the template parameter.
     * @example "TriggeringUser"
     */
    name: string;
    /**
     * The icon of the template parameter.
     * @example "icon-user"
     */
    iconName: string;
    /**
     * The description of the template parameter.
     */
    description?: string;
    /**
     * The colour of the template parameter's text.
     */
    color?: string;
};
type NodeType = "value" | "document" | "block" | "inline" | "text" | "leaf" | "mark" | "renderless" | "command";
declare interface TextObject<O extends NodeType> {
    object: O;
}
declare interface TextContainer<O extends "value" | "document" | "block" | "inline" | "text", C> extends TextObject<O> {
    nodes: C[];
}
declare interface BaseNode<O extends "document" | "block" | "inline", D extends object, C> extends TextContainer<O, C> {
    data: D;
}
declare interface Node<O extends "block" | "inline", T, D extends object, C> extends BaseNode<O, D, C> {
    type: T;
}
declare interface Mark extends TextObject<"mark"> {
    type: "bold" | "italic" | "strikethrough" | "underline";
}
declare interface Leaf extends TextObject<"leaf"> {
    text: string;
    marks: Mark[];
}
declare interface LeafContainer extends TextObject<"text"> {
    leaves: Leaf[];
}
export type InlineNode = Node<"inline", string, object, LeafContainer>;
export type BlockNode = Node<"block", string, object | undefined, InlineNode | LeafContainer>;
export type MessageDocument = BaseNode<
    "document",
    { shareUrls?: string[]; githubDeliveryId?: string } | undefined,
    BlockNode
>;
export declare interface MessageContent extends TextObject<"value"> {
    document: MessageDocument;
}
export type AnyMessageObject = LeafContainer | Leaf | InlineNode | BlockNode;
