import React from "react";
import { Size } from "./common";

type SectionType = "rows" | "list";
type ActionType = "default" | "toggle";

//#region Menu specs
export declare interface MenuSpecs {
    id: string;
    paddingSize?: Size;
    sections: MenuSectionSpecs[];
}
export declare interface MenuSectionSpecs {
    id?: string;
    name?: string;
    /**
     * The displayed name of the section.
     */
    header?: string;
    type?: SectionType;
    actions: MenuActionSpecs[];
}
export declare interface MenuActionSpecs {
    /**
     * The type of action it is.
     * @default "default"
     */
    type?: ActionType;
    /**
     * The name of the action that will be displayed.
     * @example "Do things"
     */
    label: string;
    /**
     * The description text that will appear below the label.
     * @example "This action does things"
     */
    bodyText?: string;

    onClick: () => void;
    /**
     * Same as onClick, but only present in Slate toolbars
     */
    onAction?: () => void;

    /**
     * The icon of the action that will appear at the left side of the label.
     * @example "icon-hashtag-new"
     */
    icon?: string;
    /**
     * The colour of the action that will appear at the left side of the label instead of an icon. This is used in status menu.
     * @example "#FF0000"
     */
    color?: string;
    /**
     * Whether to show the badge count. This will be overriden if badgeCount > 0.
     * @default false
     */
    showBadge?: boolean;
    /**
     * The count in a badge that will be displayed if it's above 0.
     * @default 0
     */
    badgeCount?: number;
    /**
     * Whether the button is golden.
     * @default false
     */
    golden?: boolean;
    /**
     * Whether the button should be highlighted. This will display text as yellow.
     * @default false
     */
    highlighted?: boolean;
    /**
     * Whether it's a destructive action. This will display the item as red.
     * @default false
     */
    destructive?: boolean;
    /**
     * The type of the section it is in.
     */
    sectionType?: SectionType;
}
//#endregion

//#region Components
type OverflowButtonProps = {
    className?: string;
    menuSpecs: MenuSpecs;
    type?: "light" | "dark";
};

export declare class OverflowButton extends React.Component<OverflowButtonProps> {
    constructor(props: OverflowButtonProps, context: object);
    /**
     * Whether the menu of the overflow button is open.
     */
    get isOpen(): boolean;
}
//#endregion
