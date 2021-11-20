// export declare class SearchBar extends React.Component {
//     constructor(props: {
//         className?: string,
//         placeholder: string,
//         autoComplete: "on" | "off",
//         onChange: () => void,
//         onEnterPressed: () => void,
//         onEscapePressed: () => void,
//     }, context?: object);
//     /**
//      * The element that is used as an input.
//      */
//     get _inputRef(): Element;
//     /**
//      * Whether the searchbar is focused or not.
//      */
//     get isFocused(): boolean;
// }
// export declare class OverflowButton extends React.Component {
//     constructor(props: {
//         className?: string,
//         menuSpecs: MenuSpecs
//     }, context: object);
//     /**
//      * Whether the menu of the overflow button is open.
//      */
//     get isOpen(): boolean;
// }
// export declare class NullState extends React.Component {
//     constructor(props: {
//         className?: string,
//         // Image
//         type?: string,
//         imageSrc?: string,
//         size?: Size,
//         // Text
//         title: string,
//         subtitle: string,
//         // Button
//         onClick?: () => void,
//         buttonText?: string,
//         isButtonDisabled?: boolean,
//         alignment?: "left" | "center" | "right",
//         style?: any,
//         buttonProps?: object,
//         customComponent?: Function
//     }, context?: object);
//     get imageSrc(): string;
// }
// export declare class Button extends React.Component {
//     constructor(props: {
//         href?: string,
//         onClick?: (e: MouseEvent) => void,

//         // Tooltip for disabled button
//         disabled?: boolean,
//         disabledTooltip?: boolean,
//         disabledTooltipDirection?: "left" | "right",
//     }, context?: object);
//     /**
//      * Whether to use context when hovering.
//      */
//     get useHoverContext(): boolean;
//     get Component(): React.Component;
//     get componentProps(): object;
// }
// export declare class GuildedSvg extends React.Component {
//     constructor(props: {
//         iconName: string
//     }, context?: object);
// }
// export declare class GuildedForm extends React.Component {
//     constructor(props: {
//         formSpecs: FormSpecs,
//         onChange?: ({
//             hasChanged: boolean,
//             changedValues: {
//                 [fieldName: string]: any,
//             },
//             values: {
//                 [fieldName: string]: any
//             }
//             isValid: boolean,
//         })
//     }, context?: object);
// }
// export declare class ItemManager<T> extends React.Components {
//     constructor(props: {
//         className?: string,
//         hasLoaded: boolean,
//         hasErrored?: boolean,
//         columnKeys: string[],
//         items: T[],
//         specs: {
//             values: {
//                 [columnKey: string]: {
//                     label: string,
//                     /** Key in the given T type's object */
//                     itemKey?: string,
//                     getValue?: (info: { item: T }) => any,
//                     getValueDisplay?: (info: { item: T }) => React.Component | string,
//                     getValueDisplayTooltip?: (infop: { item: T }) => string
//                 }
//             },
//             columns: {
//                 [columnKey: string]: {
//                     valueKey: string,
//                     style?: { maxWidth: number, width?: number },
//                     nativeStyle?: { maxWidth: number, width?: number },
//                     overrideStyle?: { maxWidth?: number, width?: number },
//                     valueRenderer: (info: { item: T }) => Function,
//                 }
//             },
//             sort: {
//                 [columnKey: string]: {
//                     /** 0 being the highest priority */
//                     priority: number,
//                     /** Whether sorting is disabled */
//                     isSystemSortOnly?: boolean,
//                     /**
//                      * Function for comparing first value's priority over the second value.
//                      * 
//                      * - If 1 is given, first value is prioritized over second.
//                      * - If -1 is given, second value is prioritized over first.
//                      */
//                     compareFunc?: (info: { value1: T, value2: T }) => 1 | -1
//                 }
//             },
//             filter: {
//                 [columnKey: string]: {
//                     options: Array<{
//                         id: string,
//                         label: string,
//                         value?: any,
//                         lowerValue?: any,
//                         upperValue?: any
//                     }>,
//                     allOptionLabel: string,
//                     /** Whether multiple values are allowed */
//                     isMulti: boolean,
//                     priority: number
//                 }
//             },
//             /** List of buttons that appear at the top right side when items get selected. */
//             selectedItemActions: [
//                 {
//                     id: string,
//                     label: string,
//                     iconName?: string,
//                     action?: () => void,
//                     getIsDisabled?: (info: { itemIds: any[] }) => boolean,
//                     disabledTooltip?: string
//                 }
//             ],
//             defaultValues: {
//                 /** Column key that will be used to sort by default. */
//                 sortKey: string,
//                 sortDirection?: "desc"
//             },
//             display: {
//                 /**
//                  * Item names that will appear as "1 label" or "2 labels".
//                  * 
//                  * - `s` will be aded at the end if there are more than 1 item.
//                  */
//                 label: string
//                 /** The text that will be used in the search bar. */
//                 searchPlaceholder: string
//             },
//             controlSpecs: {
//                 /** The button that will be always visible in the top right corner */
//                 altButtonText?: string,
//                 onAltButtonClick?: (...args) => void
//             },
//             itemOptions?: {
//                 getCanView: () => boolean,
//                 onOpen: (...args) => void
//             },
//             asyncOtions?: {
//                 onFiltersChange?: (...args) => void,
//                 onLoadNextPage?: (...args) => void,
//                 onSearchChange?: (...args) => void
//             },
//             onNavigate?: (...args) => void
//         },
//         iconComponent?: Function,
//         getIconProps?: (item: T) => object,
//         hasMoreItemsToDisplay?: boolean
//     }, context: object)
// }
// export type Size = "lg" | "md" | "sm" | "xsm";
// export type MenuSpecs = {
//     id: string,
//     sections: Array<{
//         name?: string,
//         header?: string,
//         type: "rows" | "list",
//         actions: Array<{
//             label: string,
//             /** @example "icon-hashtag-new"  */
//             icon: string,
//             onClick: () => void,
//             /** Same as onClick, but only present in Slate toolbars */
//             onAction?: () => void
//         }>
//     }>
// }
// export type FormSpecs = {
//     sections: Array<{
//         name?: string,
//         header?: string,
//         rowMarginSize?: Size,
//         rowStyle?: "constrained-width",
//         sectionStyle?: "border-unpadded",
//         // FieldSpec depends on type, so that sucks
//         fieldSpecs: Array<FieldSpecs<string, any>>
//     }>
// };
// export declare interface FieldSpecs<N, V> {
//     /** The type of the field */
//     type: N,
//     /** Field name that will be used for formSpecs values list */
//     fieldName: string,
//     /** Default value of the field if none is provided */
//     defaultValue?: V,
//     /** The current value of the field */
//     value?: V,
//     /** Whether the field is optional and its value doesn't need to be changed */
//     isOptional?: boolean,
//     /** Whether the field is disabled from use */
//     disabled?: boolean
// }