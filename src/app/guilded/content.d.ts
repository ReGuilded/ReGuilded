import { Size } from "./common";
import React from "react";

type NullStateProps = {
    className?: string,
    // Image
    type?: string,
    imageSrc?: string,
    size?: Size,
    // Text
    title: string,
    subtitle: string,
    // Button
    onClick?: () => void,
    buttonText?: string,
    isButtonDisabled?: boolean,
    alignment?: "left" | "center" | "right",
    style?: any,
    buttonProps?: object,
    customComponent?: Function
};
type SvgIconProps = {
    className?: string,
    iconName: string
};
type GuildedTextProps = {
    type:
        "title" | "heading1" | "heading2" | "heading3" | "heading4" | "heading6" |
        "headinglg" | "headingxl" | "subheading" |
        "subtext" | "subtext2" | "subtext3" | "subtextHeading" |
        "subtextBodyWhite" | "bigBody" | "fineText" | "gray",
    weight?: "normal" | "semibold" | "bold",
    color?: "bodyWhite" | "white" | "gray" | "gilded1" | "errorRed"
};

export declare class NullState extends React.Component<NullStateProps> {
    constructor(props: NullStateProps, context?: object);
    get imageSrc(): string;
}
export declare class SvgIcon extends React.Component<SvgIconProps> {
    constructor(props: SvgIconProps, context?: object);
}
export declare class GuildedText extends React.Component<GuildedTextProps> {
    constructor(props: GuildedTextProps, context?: object);
}
export declare class ItemManager<T> extends React.Component {
    constructor(props: {
        className?: string,
        hasLoaded: boolean,
        hasErrored?: boolean,
        columnKeys: string[],
        items: T[],
        specs: {
            values: {
                [columnKey: string]: {
                    label: string,
                    /** Key in the given T type's object */
                    itemKey?: string,
                    getValue?: (info: { item: T }) => any,
                    getValueDisplay?: (info: { item: T }) => React.Component | string,
                    getValueDisplayTooltip?: (infop: { item: T }) => string
                }
            },
            columns: {
                [columnKey: string]: {
                    valueKey: string,
                    style?: { maxWidth: number, width?: number },
                    nativeStyle?: { maxWidth: number, width?: number },
                    overrideStyle?: { maxWidth?: number, width?: number },
                    valueRenderer: (info: { item: T }) => Function,
                }
            },
            sort: {
                [columnKey: string]: {
                    /** 0 being the highest priority */
                    priority: number,
                    /** Whether sorting is disabled */
                    isSystemSortOnly?: boolean,
                    /**
                     * Function for comparing first value's priority over the second value.
                     * 
                     * - If 1 is given, first value is prioritized over second.
                     * - If -1 is given, second value is prioritized over first.
                     */
                    compareFunc?: (info: { value1: T, value2: T }) => number
                }
            },
            filter: {
                [columnKey: string]: {
                    options: Array<{
                        id: string,
                        label: string,
                        value?: any,
                        lowerValue?: any,
                        upperValue?: any
                    }>,
                    allOptionLabel: string,
                    /** Whether multiple values are allowed */
                    isMulti: boolean,
                    priority: number
                }
            },
            /** List of buttons that appear at the top right side when items get selected. */
            selectedItemActions: [
                {
                    id: string,
                    label: string,
                    iconName?: string,
                    action?: () => void,
                    getIsDisabled?: (info: { itemIds: any[] }) => boolean,
                    disabledTooltip?: string
                }
            ],
            defaultValues: {
                /** Column key that will be used to sort by default. */
                sortKey: string,
                sortDirection?: "desc"
            },
            display: {
                /**
                 * Item names that will appear as "1 label" or "2 labels".
                 * 
                 * - `s` will be aded at the end if there are more than 1 item.
                 */
                label: string
                /** The text that will be used in the search bar. */
                searchPlaceholder: string
            },
            controlSpecs: {
                /** The button that will be always visible in the top right corner */
                altButtonText?: string,
                onAltButtonClick?: (...args) => void
            },
            itemOptions?: {
                getCanView: () => boolean,
                onOpen: (...args) => void
            },
            asyncOtions?: {
                onFiltersChange?: (...args) => void,
                onLoadNextPage?: (...args) => void,
                onSearchChange?: (...args) => void
            },
            onNavigate?: (...args) => void
        },
        iconComponent?: Function,
        getIconProps?: (item: T) => object,
        hasMoreItemsToDisplay?: boolean
    }, context: object)
}