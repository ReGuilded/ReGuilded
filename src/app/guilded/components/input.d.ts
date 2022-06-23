import { FieldDropdownProps, OptionSpecs } from "../form";
import { ComponentText, HasDisabledState, Size } from "../common";
import React from "react";

//#region Button
export type ButtonType = "gilded" | "delete" | "success" | "monochrome" | "bleached" | "white" | "whiteBg" | "stripe";

export declare interface ButtonProps extends HasDisabledState {
    // Looks
    /**
     * The text of the button.
     */
    buttonText?: string;
    /**
     * The style of the button.
     * @default "filled"
     */
    style?: "filled" | "hollow";
    /**
     * The type of the button it is.
     *
     * Success is only used in mobile version, while monochrome is never used and bleached is only used as hollow button.
     * @default "gilded"
     */
    buttonType?: ButtonType;
    /**
     * The size of the button.
     * @default "md"
     */
    size?: Size;
    /**
     * @default false
     */
    isWide?: boolean;

    // Looks (Icons)
    /**
     * The name of the icon to use before the button's text.
     */
    prefixIconName?: string;
    /**
     * The name of the icon to use after the button's text.
     */
    suffixIconName?: string;
    /**
     * The class to use for the prefix icon.
     */
    prefixIconClassname?: string;
    /**
     * The class to use for the suffix icon.
     */
    suffixIconClassname?: string;

    // Functionality
    /**
     * The function to use when the button is clicked.
     */
    onClick?: (event: MouseEvent) => void;
    /**
     * The link it should open.
     */
    href?: string;
    /**
     * @default false
     */
    loading?: boolean;

    /**
     * Whether the button is not available to be clicked.
     */
    disabled?: boolean;
}
export declare class Button extends React.Component<ButtonProps> {
    /**
     * Whether to use context when hovering.
     */
    get useHoverContext(): boolean;
    get Component(): typeof React.Component;
    get componentProps(): object;
}
//#endregion

//#region GuildedSelect
export declare class GuildedSelect extends React.Component<FieldDropdownProps & { onChange?: (option: OptionSpecs) => void }> {
    get selectedValue(): OptionSpecs | any;
    get selectOptions(): OptionSpecs[];
}
//#endregion

//#region SearchBarV2
export declare class SearchBarV2 extends React.Component<{
    className?: string;
    placeholder: string;
    /**
     * The value of the searchbar.
     */
    searchTerm?: string;
    theme?: "gray";
    size?: Size;
    autoFocus?: boolean;
    onChange: (input: string) => void | PromiseLike<void>;
    onEnterPressed?: (input: KeyboardEvent) => void | PromiseLike<void>;
    onEscapePressed?: (input: KeyboardEvent) => void | PromiseLike<void>;
}> {
    /**
     * The element that is used as an input.
     */
    get _inputRef(): Element;
    /**
     * Whether the searchbar is focused or not.
     */
    get isFocused(): boolean;
}
//#endregion

//#region SimpleToggle
export declare class SimpleToggle extends React.Component<{
    className?: string;
    label: ComponentText;
    onChange?: (enabled: boolean | number) => void;
    defaultValue?: boolean;
}> {}
//#endregion
