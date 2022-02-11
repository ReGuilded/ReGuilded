import { ComponentText, DirectionVertical, Size } from "../common";
import React, { CSSProperties } from "react";
import { ButtonProps } from "../input";

//#region BadgeV2
export declare class BadgeV2 extends React.Component<{
    count?: number;
    hasBorder?: boolean;
    isDot?: boolean;
}> {}
//#endregion

//#region BannerWithButton
export declare class BannerWithButton extends React.Component<{
    title?: ComponentText;
    text: ComponentText;
    iconName?: string;
    className?: string;
    imgSrc?: string;
    theme?: "warning" | "error" | "info" | string;
    children?: React.ReactNode | React.ReactNode[];
    buttonProps?: any;
}> {
    get hasText(): boolean;
}
//#endregion

//#region CalloutBadge
export type CalloutBadgeProps = {
    className?: string;
    text?: ComponentText;
    style?: React.CSSProperties;
    hoverText?: string;
    hoverDirection?: DirectionVertical;
    contentEditable?: boolean;
};
export declare class CalloutBadge extends React.Component<CalloutBadgeProps> {
    get style(): React.CSSProperties;
}
//#endregion

//#region CheckmarkIcon
export declare class CheckmarkIcon extends React.Component<{
    className?: string;
    selected?: boolean;
    radio?: boolean;
    isDisabled?: boolean;
    type?: "guilded" | "success";
    onClick?: Function;
    size?: Size;
}> {}
//#endregion

//#region CodeContainer
export declare class CodeContainer extends React.Component<{
    language: string;
    code: string;
    canCopyContents?: boolean;
    readOnly?: boolean;
    header?: ComponentText;
    className?: string;
}> {
    get tokens();
    get tokenCodeLines();
}
//#endregion

//#region GuildedText
export declare class GuildedText extends React.Component<{
    type:
        | "title"
        | "heading1"
        | "heading2"
        | "heading3"
        | "heading4"
        | "heading6"
        | "headinglg"
        | "headingxl"
        | "subheading"
        | "subtext"
        | "subtext2"
        | "subtext3"
        | "subtextHeading"
        | "subtextBodyWhite"
        | "bigBody"
        | "fineText"
        | "gray";
    weight?: "normal" | "semibold" | "bold";
    color?: "bodyWhite" | "white" | "gray" | "gilded1" | "errorRed";
    className?: string;
    block?: boolean;
    ellipsify?: boolean;
    centered?: boolean;
    breakUserContent?: boolean;
    title?: string;
}> {}
//#endregion

//#region IconAndLabel
export declare class IconAndLabel extends React.Component<{
    className?: string;
    iconClassName?: string;
    labelClassName?: string;

    iconName: string;
    label: ComponentText;

    iconPosition?: "left" | "right";
    onClick?: (event: MouseEvent) => void;
}> {}
//#endregion

//#region LoadingAnimationMicro
export declare class LoadingAnimationMicro extends React.Component<{
    className?: string;
    dark?: boolean;
    fudgeTop?: number;
    fudgeLeft?: number;
    noFudge?: boolean;
}> {
    get containerStyle(): CSSProperties;
}
//#endregion

//#region NullState
export declare class NullState extends React.Component<{
    className?: string;
    // Image
    type?: string;
    imageSrc?: string;
    size?: Size;
    customComponent?: Function;
    // Text
    title: ComponentText;
    subtitle: ComponentText;
    // Button
    onClick?: () => void;
    buttonText?: string;
    isButtonDisabled?: boolean;
    alignment?: "left" | "center" | "right";
    style?: any;
    buttonProps?: ButtonProps;
}> {
    get imageSrc(): string;
}
//#endregion

//#region SvgIcon
export type SvgIconProps = {
    className?: string;
    iconName: string;
};
export declare class SvgIcon extends React.Component<SvgIconProps> {}
//#endregion

//#region WordDividerLine
export declare class WordDividerLine extends React.Component<{
    word?: ComponentText;
    wordStyle?: "normal" | "semibold" | "bold" | "chat" | "alert";
    onGetRef?: Function;
}> {}
//#endregion

//#region ItemManager
export declare class ItemManager<T> extends React.Component {
    constructor(
        props: {
            className?: string;
            hasLoaded: boolean;
            hasErrored?: boolean;
            columnKeys: string[];
            items: T[];
            specs: {
                values: {
                    [columnKey: string]: {
                        label: string;
                        /** Key in the given T type's object */
                        itemKey?: string;
                        getValue?: (info: { item: T }) => any;
                        getValueDisplay?: (info: { item: T }) => React.Component | string;
                        getValueDisplayTooltip?: (infop: { item: T }) => string;
                    };
                };
                columns: {
                    [columnKey: string]: {
                        valueKey: string;
                        style?: { maxWidth: number; width?: number };
                        nativeStyle?: { maxWidth: number; width?: number };
                        overrideStyle?: { maxWidth?: number; width?: number };
                        valueRenderer: (info: { item: T }) => Function;
                    };
                };
                sort: {
                    [columnKey: string]: {
                        /** 0 being the highest priority */
                        priority: number;
                        /** Whether sorting is disabled */
                        isSystemSortOnly?: boolean;
                        /**
                         * Function for comparing first value's priority over the second value.
                         *
                         * - If 1 is given, first value is prioritized over second.
                         * - If -1 is given, second value is prioritized over first.
                         */
                        compareFunc?: (info: { value1: T; value2: T }) => number;
                    };
                };
                filter: {
                    [columnKey: string]: {
                        options: Array<{
                            id: string;
                            label: string;
                            value?: any;
                            lowerValue?: any;
                            upperValue?: any;
                        }>;
                        allOptionLabel: string;
                        /** Whether multiple values are allowed */
                        isMulti: boolean;
                        priority: number;
                    };
                };
                /** List of buttons that appear at the top right side when items get selected. */
                selectedItemActions: [
                    {
                        id: string;
                        label: string;
                        iconName?: string;
                        action?: () => void;
                        getIsDisabled?: (info: { itemIds: any[] }) => boolean;
                        disabledTooltip?: string;
                    }
                ];
                defaultValues: {
                    /** Column key that will be used to sort by default. */
                    sortKey: string;
                    sortDirection?: "desc";
                };
                display: {
                    /**
                     * Item names that will appear as "1 label" or "2 labels".
                     *
                     * - `s` will be aded at the end if there are more than 1 item.
                     */
                    label: string;
                    /** The text that will be used in the search bar. */
                    searchPlaceholder: string;
                };
                controlSpecs: {
                    /** The button that will be always visible in the top right corner */
                    altButtonText?: string;
                    onAltButtonClick?: (...args) => void;
                };
                itemOptions?: {
                    getCanView: () => boolean;
                    onOpen: (...args) => void;
                };
                asyncOtions?: {
                    onFiltersChange?: (...args) => void;
                    onLoadNextPage?: (...args) => void;
                    onSearchChange?: (...args) => void;
                };
                onNavigate?: (...args) => void;
            };
            iconComponent?: Function;
            getIconProps?: (item: T) => object;
            hasMoreItemsToDisplay?: boolean;
        },
        context: object
    );
}
//#endregion
