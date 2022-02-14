import React, { ReactNode } from "react";
import { ComponentText, Size } from "../common";
import { CalloutBadgeProps } from "./content";

///#region ScreenHeader
export declare class ScreenHeader extends React.Component<{
    className?: string;
    children?: ReactNode | ReactNode[];

    channel?: object;
    iconName?: string;
    iconSize?: Size;
    name?: ComponentText;
    description?: ComponentText;

    isBackLinkVisible?: boolean;
    headerLabelSpecs?: CalloutBadgeProps[];
    onBackClick?: () => void | PromiseLike<void>;
}> {
    /**
     * Whether the header has an icon.
     */
    get hasIcon(): boolean;
    /**
     * Whether the header has a title.
     */
    get hasLabels(): boolean;
}
//#endregion
