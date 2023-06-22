import { FieldDropdownProps, OptionSpecs } from "./form";
import { Size } from "./common";
import React from "react";

//#region Button
export type ButtonType =
    | "gilded"
    | "delete"
    | "success"
    | "monochrome"
    | "bleached"
    | "white"
    | "whiteBg"
    | "stripe"
    | string;
export type ButtonProps = {
    href?: string;
    onClick?: (e: MouseEvent) => void;

    // Tooltip for disabled button
    disabled?: boolean;
    disabledTooltip?: boolean;
    disabledTooltipDirection?: "left" | "right";
};
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
export declare class GuildedSelect extends React.Component<
    FieldDropdownProps & { onChange?: (option: OptionSpecs) => void }
> {
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

// //#region SimpleToggle
// export declare class SimpleToggle extends React.Component<{
//     label: string;
//     onChange?: (enabled: boolean | number) => void;
//     defaultValue?: boolean;
// }> {}
// //#endregion

//#region ToggleFieldWrapper
export declare class ToggleFieldWrapper extends React.Component<{
    fieldSpec: {
        label: string;
        fieldName: string;
        layout?: "space-between";
        onChange?: (enabled: boolean | number) => void;
        defaultValue?: boolean;
        onChangeFireImmediately?: boolean;
    }
}> {}
//#endregion

//#region SimpleToggle
export declare class SwitchInput extends React.Component<{
    label: string;
    fieldName: string;
    layout?: "space-between";
    onChange?: (enabled: boolean | number) => void;
    defaultValue?: boolean;
    onChangeFireImmediately?: boolean;
}> {}
//#endregion
