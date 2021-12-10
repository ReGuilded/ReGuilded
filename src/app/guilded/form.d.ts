import { MessageContent, TemplateParameterOptions } from "./rich-text";
import React, { ReactElement } from "react";
import { Alignment, Size } from "./common";

//#region Form specs
export type FormSpecs = {
    header?: string,
    description?: string,
    rowStyle?: RowStyle,
    headerStyle?: HeaderStyle,
    sectionStyle?: SectionStyle,
    sections: FormSectionSpecs[],
    /**
     * The functions that will be called once field changes its value.
     */
    fieldValueReactions?: {
        [fieldName: string]: (value: any, formValues: { [fieldName: string]: any }, fieldName: string) => void
    }
};
declare interface FormSectionSpecs {
    name?: string,
    header?: string,
    rowMarginSize?: Size,
    sectionStyle?: SectionStyle,
    rowStyle?: RowStyle,
    // FieldSpec depends on type, so that sucks
    fieldSpecs: FieldAnySpecs[]
}
type SectionStyle
    = "padded" | "unpadded" | "indented-padded" | "no-border-unpadded"
    | "border" | "border-unpadded" | "border-lg"
    | "background-inset";
type RowStyle = "border-unpadded" | "border-padding-s" | "border-padding-md" | "constrained-width";
type HeaderStyle = "collapsible";

//#region Fields
export type FieldAnySpecs
    // Basic
    = (FieldTextSpecs       | FieldTextAreaSpecs
    // Number & Range
    | FieldNumberSpecs      | FieldRangeSpecs
    // Date
    | FieldDateSpecs        | FieldTimeSpecs         | FieldDateAndTimeRangeSpecs
    | FieldEventRepeatSpecs
    // Toggling
    | FieldSwitchSpecs      | FieldTriStateSpecs
    // With options
    | FieldDropdownSpecs    | FieldRadioSpecs        | FieldCheckboxesSpecs
    | FieldIconMenuSpecs    | FieldTableSpecs
    // Visual
    | FieldImageSpecs       | FieldColorSpecs
    // Flow
    | FieldReactionSpecs
    // Exotic
    | FieldCustomFormSpecs  | FieldItemKeybindsSpecs
    | FieldSpecs<string, any>) & object;

//#region Interfaces
declare interface FieldSpecs<N, V> {
    /**
     * The type of the field
     */
    type: N;
    /**
     * Field name that will be used for formSpecs values list
     */
    fieldName: string;

    /**
     * Default value of the field if none is provided
     */
    defaultValue?: V;

    /**
     * Whether the field is optional and its value doesn't need to be changed.
     */
    isOptional?: boolean;
    /**
     * Whether the field is disabled from use.
     * @default false
     */
    isDisabled?: boolean;
    /**
     * What the tooltip says when hovering over the disabled field.
     */
    disabledTooltip?: string;

    /**
     * The identifier of the row that this field will be included in with other fields.
     */
    rowCollapseId?: string;
    /**
     * Whether to grow and take up left space in the row.
     * @default 1
     */
    grow?: 1 | 0;
    /**
     * The function that will be used to validate the value of the text field.
     */
    validationFunction?: ValidationFunction;
}
declare interface FieldBasics {
    /**
     * The displayed name of the field.
     */
    label?: string;
    /**
     * The description of the field that will appear below the field.
     */
    description?: string;
    /**
     * Whether the description should be displayed above the field instead of below it.
     * @default false
     */
    isDescriptionAboveField?: boolean;
    /**
     * The class to add to the field.
     */
    className?: string;
}
declare interface FieldWithHeader extends FieldBasics {
    /**
     * The header that will appear above the field.
     */
    header?: string;
}
declare interface FieldHasOptions<O> extends FieldBasics {
    /**
     * The list of field options available.
     */
    options: O[];
    size?: Size;
}
declare interface FieldToggleSpecs<N, V> extends FieldSpecs<N, V>, FieldWithHeader {
    size?: Size;
    layout?: "space-between";
    iconName?: string;
    tooltip?: string;
    /**
     * @default "icon-info-hollow"
     */
    tooltipIconName?: string;
    /**
     * @default "sm"
     */
    tooltipSize?: Size;
    info?: any;
    /**
     * @default "icon-info"
     */
    infoIconName?: string;
}
//#endregion

//#region Field definitions
declare interface FieldTextSpecs extends FieldSpecs<"Text", string>, FieldBasics {
    /**
     * The time to wait before validating the value of the field.
     */
    validationDebounceMs?: number;
    /**
     * The type of content this text field uses.
     */
    inputType?: "number" | "password";
}
declare interface FieldTextAreaSpecs extends FieldSpecs<"TextArea", string>, FieldWithHeader {
    /**
     * The placeholder of the text area that will be seen if no value is present.
     */
    placeholder?: string;
    /**
     * The minimum length of the value required for the field to be valid.
     * @default 0
     */
    minLength?: number;
    /**
     * The maximum length of the value that it can reach before the field becomes invalid.
     * @default Infinity
     */
    maxLength?: number;
    /**
     * Whether to show the wheel of how many characters are remaining in the text area.
     * @default false
     */
    showCharactersRemaining?: boolean;
    isInvalidWhenLoading?: boolean;
}
declare interface FieldRichText extends FieldSpecs<"RichText", MessageContent>, FieldBasics {
    placeholder?: string;
    style?: "padded";
    /**
     * The type of the editor it is. If it's "simple", then the toolbar is hidden.
     */
    editorType?: "simple";
    editorForceMaxHeightForAllEditorTypes?: boolean;
    /**
     * The available plugins in the editor. If this is present, `+` menu is removed.
     */
    insertPlugins?: object[];
    templateParameterTypeaheadOptions?: TemplateParameterOptions[];
    showValidationErrors?: boolean;
    validationFunction?: ValidationFunction;
}
declare interface FieldNumberSpecs extends FieldSpecs<"Number", number> {
    /**
     * The max number allowed.
     */
    number: number;
    caption?: string;
    isStandalone?: boolean;
}
declare interface FieldSwitchSpecs extends FieldToggleSpecs<"Switch", boolean> {
    /**
     * The name of the icon to display before the switch.
     * @example "icon-clock-new"
     */
    iconName?: string;
}
declare interface FieldTriStateSpecs extends FieldToggleSpecs<"TriState", "on" | "passThrough" | "off"> {
    /**
     * @default false
     */
    isDisabled?: boolean;
    disabledTooltip?: string;
    /**
     * @default null
     */
    triStateDisabledButton?: null | 1;
}
declare interface FieldDropdownProps extends FieldHasOptions<OptionSpecs> {
    placeholder?: string;
    /**
     * @default false
     */
    searchable?: boolean;
    /**
     * @default false
     */
    isMultiSelect?: boolean;
    openOnClick?: boolean;
    openOnFocus?: boolean;
    /**
     * @default true
     */
    isDark?: boolean;
    removeSelected?: boolean;
    /**
     * @default true
     */
    closeOnSelect?: boolean;
    clearSelectionLabel?: boolean;
    /**
     * @default false
     */
    clearable?: boolean;
    /**
     * @default "No results found"
     */
    noResultsText?: string;
    /**
     * @default false
     */
    isDirectionUp?: boolean;
    /**
     * @default false
     */
    noBorder?: boolean;
    /**
     * @default false
     */
    noPadding?: boolean;
    optionColor?: any;
    /**
     * @default false
     */
    contentEditable?: boolean;
    optionSubLabelRenderer: (option: OptionSpecs) => ReactElement;
    useFuzzySort?: boolean;
    fuzzySortMaxResults?: number;
}
declare interface FieldDropdownSpecs extends FieldSpecs<"Dropdown", OptionSpecs | any>, FieldDropdownProps { }
declare interface FieldRadioSpecs extends FieldSpecs<"Radios", any | OptionRadioSpecs>, FieldHasOptions<OptionRadioSpecs> {
    labelFlavor?: "subtle";
    labelMarginSize?: Size;
    numColumns?: number;
    panelFlavor?: "compact";
    /**
     * Makes all radio options panels.
     */
    isPanel?: boolean;
    /**
     * Makes all radio options have checkbox instead of circle.
     */
    isCheckbox?: boolean;
    layout?: Alignment;
    renderComponent?: typeof React.Component;
    optionDetailsByName?: {
        [optionName: string]: any
    }
}
declare interface FieldCheckboxesSpecs extends FieldSpecs<"Checkboxes", Array<{ optionName: string, value: boolean }>>, FieldHasOptions<OptionSpecs> {
    numColumns?: number;
}
declare interface FieldIconMenuSpecs extends FieldSpecs<"IconMenu", string>, FieldHasOptions<OptionSpecs> {
    iconType?: "color";
    isRemovable?: boolean;
    hideRemove?: boolean;
}
declare interface FieldButtonSpecs extends FieldSpecs<"Button", undefined> {
    /**
     * The text of the button.
     */
    buttonText?: string;
    /**
     * The function to use when the button is clicked.
     */
    onClick?: (event: MouseEvent) => void;
    /**
     * The style of the button.
     * @default "filled"
     */
    style?: "filled" | "hollow";
    /**
     * The type of the button it is.
     * @default "gilded"
     */
    buttonType?: "gilded" | "delete" | "success" | "bleached" | "monochrome";
    /**
     * The size of the button.
     * @default "md"
     */
    size?: Size;
    /**
     * @default false
     */
    isWide?: boolean;
    /**
     * @default false
     */
    loading?: boolean;
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
}
declare interface FieldDateAndTimeRangeSpecs extends FieldSpecs<"DateAndTimeRange", { startMoment: object, endMoment: object }>, FieldBasics {
    allowPastValues?: boolean;
}
declare interface FieldEventRepeatSpecs extends FieldSpecs<"EventRepeat", { repeatType: "once", isValid: boolean }>, FieldBasics {
    defaultStartDate?: boolean;
}
declare interface FieldDateSpecs extends FieldSpecs<"Date", object>, FieldBasics {
    hasError?: boolean;
    allowPastValues?: boolean;
}
declare interface FieldTimeSpecs extends FieldSpecs<"Time", number>, FieldBasics {
    showTimezone?: boolean;
    showInlineTimezone?: boolean;
    hasError?: boolean;
}
declare interface FieldColorSpecs extends FieldSpecs<"Color", string>, FieldBasics {
    size?: Size;
    useLightColor?: boolean;
}
declare interface FieldImageSpecs extends FieldSpecs<"Image", string>, FieldBasics {
    /**
     * Instructions that appear at the right side of the image. This usually tells what image size user should typically use or any other information.
     */
    instructions?: string;
    /**
     * Aspect ratio of height to width.
     */
    aspectRatio?: number;
    /**
     * Maximum width that image can take.
     */
    maxWidth?: number;
    /**
     * Minimum width that image can take.
     */
    minWidth?: number;
    imageStyle?: "rounded";
    /**
     * The text that upload button should use instead of "Upload".
     * @default "Upload"
     */
    buttonLabel?: string;
    hideControls?: boolean;
    displayFormat?: "Medium";
    dynamicMediaTypeId?: string;
    showColoredUploadButton?: boolean;
    imageInputClassName?: string;
    friendlyUploadName?: string;
}
declare interface FieldRangeSpecs extends FieldSpecs<"Range", { max: number, min: number }>, FieldBasics {
    rangeType?: "gilded";
    size?: Size;
    /**
     * The function that will be used to display a label based on changed range value.
     * @example ({ min, max }) => `Members ${min}-${max}`
     */
    selectedValueFunction?: (value: { max: number, min: number }) => string;
    details?: { max: number, min: number };
    /**
     * Whether to allow only maximum number to be changed. If false, this makes range 2-way with 2 thumbs.
     * @default true
     */
    lockMinValue?: boolean;
    hideLabels?: boolean;
}
type KeybindValue = {
    id: string,
    keys: Array<{
        key: string,
        virtualKey: string
    }>,
    entities: Array<OptionDropdownSpecs>
}
declare interface FieldItemKeybindsSpecs extends FieldSpecs<"ItemKeybinds", KeybindValue[]> {
    /**
     * The text that will be displayed when there are no keybinds set.
     */
    emptyStateText?: string;
    /**
     * The text that will be displayed for adding new roles, users or other entities.
     */
    entitySubtext?: string;
    dropdownProps?: FieldDropdownProps;
}
declare interface FieldTableSpecs extends FieldSpecs<"Table", Array<{ optionName: string } & object>> {
    rowInputType: string;
    emptyText: string;
    itemClass?: string;
    headerSpecs: Array<
        { text: string, key: string } | Array<{ text: string, key: string }>
    >
}
declare interface FieldCustomFormSpecs extends FieldSpecs<"CustomForm", number> {
    /**
     * Whether the custom created form will always be public.
     */
    isAlwaysPublic?: boolean;
}
declare interface FieldReactionSpecs extends FieldSpecs<"Reaction", number> {
    size?: Size;
}
//#endregion

//#region Option definitions
declare interface OptionBaseSpecs {
    optionName: string;
}
declare interface OptionSpecs extends OptionBaseSpecs {
    label?: string;
    description?: string;
    value?: any;
    iconName?: string;
}
declare interface OptionRadioSpecs extends OptionSpecs {
    disabled?: boolean;
    //isCheckbox?: boolean;
    layout?: Alignment;
    shortLabel?: string;
}
declare interface OptionDropdownSpecs extends OptionSpecs {
    /**
     * The image of the dropdown option. This is shown as icon before the option label.
     */
    imageSrc?: string;
    /**
     * The style of the dropdown item.
     */
    labelStyle?: { color?: string };
}
declare interface OptionTableSpecs extends OptionBaseSpecs {
    renderOrnament: (option: { optionName: string, value: OptionTableSpecs & object }) => React.ReactNode;
}
//#endregion

//#endregion

//#endregion

/**
 * The function that validates text field and returns the error message or nothing.
 * @param fieldValue The value of a text field.
 * @returns The error message from the value
 */
export type ValidationFunction = (fieldValue: string) => void | undefined | string;

//#region Components
type FormProps = {
    formSpecs: FormSpecs,
    onChange?: (state: FormOutput) => void
};
export type FormValue = {
    /** Whether the form field's value has been changed. */
    hasChanged: boolean;
    /** Whether the value of the form field is valid. */
    isValid: boolean;
    /** The value of the form field. */
    value: any;
};
export type FormOutput = {
    /** Whether the form field values were changed. */
    hasChanged: boolean,
    /** The dictionary of changed fields with their values. */
    changedValues: {
        [fieldName: string]: any,
    },
    /** The dictionary of all fields with their values, including default values. */
    values: {
        [fieldName: string]: any
    }
    /** Whether all fields in the form are valid */
    isValid: boolean,
};

export declare class Form extends React.Component<FormProps> {
    constructor(props: FormProps, context?: any);

    get formValues(): { [fieldName: string]: FormValue };
    get values(): { [fieldName: string]: any };
    get changedValues(): { [fieldName: string]: any };
    get outputValues(): FormOutput;
}
//#endregion