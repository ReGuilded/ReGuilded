import { MessageContent, TemplateParameterOptions } from "./rich-text";
import React, { ReactElement, ReactNode } from "react";
import { Alignment, Size } from "./common";
import { Moment } from "moment";

//#region Form specs
export type FormSpecs = {
    header?: string;
    description?: ReactNode | ReactNode[];
    rowStyle?: RowStyle;
    headerStyle?: HeaderStyle;
    sectionStyle?: SectionStyle;
    sections: FormSectionSpecs[];
    /**
     * The functions that will be called once field changes its value.
     */
    fieldValueReactions?: {
        [fieldName: string]: (value: any, formValues: { [fieldName: string]: any }, fieldName: string) => void;
    };
};
declare interface FormSectionSpecs {
    name?: string;
    header?: string;
    footer?: string;
    rowMarginSize?: Size;
    isCollapsible?: boolean;
    isDisabled?: boolean;
    sectionStyle?: SectionStyle;
    rowStyle?: RowStyle;
    // FieldSpec depends on type, so that sucks
    fieldSpecs: FieldAnySpecs[];
}
type SectionStyle =
    | "padded"
    | "unpadded"
    | "indented-padded"
    | "no-border-unpadded"
    | "border"
    | "border-unpadded"
    | "border-lg"
    | "background-inset";
type RowStyle = "border-unpadded" | "border-padding-s" | "border-padding-md" | "constrained-width";
type HeaderStyle = "collapsible";

//#region Fields
export type FieldAnySpecs =
    // Text
    (
        | FieldTextSpecs
        | FieldTextAreaSpecs
        | FieldRichTextSpecs
        | FieldTagSpecs
        // Number & Range
        | FieldNumberSpecs
        | FieldRangeSpecs
        // Date
        | FieldDateSpecs
        | FieldTimeSpecs
        | FieldDateAndTimeRangeSpecs
        | FieldEventRepeatSpecs
        // Toggling
        | FieldSwitchSpecs
        | FieldTriStateSpecs
        | FieldButtonSpecs
        // With options
        | FieldDropdownSpecs
        | FieldRadioSpecs
        | FieldCheckboxesSpecs
        | FieldIconMenuSpecs
        | FieldTableSpecs
        // Visual
        | FieldImageSpecs
        | FieldColorSpecs
        // Flow
        | FieldReactionSpecs
        // Exotic
        | FieldCustomFormSpecs
        | FieldItemKeybindsSpecs
        | FieldHotkeySpecs
        | FieldSpecs<string, any>
    ) & { [unusedProp: string]: any };

//#region Interfaces
declare interface FieldDefaultSpecs<V> {
    label?: string;

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
declare interface FieldRequiredSpecs<N> {
    /**
     * The type of the field
     */
    type: N;
    /**
     * Field name that will be used for formSpecs values list
     */
    fieldName?: string;
}
declare interface FieldSpecs<N, V> extends FieldRequiredSpecs<N>, FieldDefaultSpecs<V> {}
declare interface FieldBasics {
    // /**
    //  * The displayed name of the field.
    //  */
    // label?: string;
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
/**
 * The field that allows one-line text.
 */
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
/**
 * The field that allows any kind of text.
 */
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
/**
 * The field that allows any kind of text with specified formatting.
 */
declare interface FieldRichTextSpecs extends FieldSpecs<"RichText", MessageContent>, FieldBasics {
    placeholder?: string;
    style?: "padded";
    /**
     * Whether the rich text field has title editor above it. If true, the label will be used as the placeholder of the title.
     * @default false
     */
    hasTitle?: boolean;
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
/**
 * The field that allows adding multiple tags.
 *
 * Only present in media post creation.
 */
declare interface FieldTagSpecs extends FieldSpecs<"Tag", string[]>, FieldBasics {
    /**
     * The array of suggested/already used tags.
     * @default []
     */
    tagOptions?: string[];
}
/**
 * The field that allows any number up to the maximum.
 *
 * Only present in event repetition. Anything else uses text field instead.
 * This is similar to dropdown.
 */
declare interface FieldNumberSpecs extends FieldSpecs<"Number", number> {
    /**
     * The max number allowed.
     */
    number: number;
    caption?: string;
    isStandalone?: boolean;
}
/**
 * The toggle field that only has enabled and disabled states.
 */
declare interface FieldSwitchSpecs extends FieldToggleSpecs<"Switch", boolean> {
    /**
     * The name of the icon to display before the switch.
     * @example "icon-clock-new"
     */
    iconName?: string;
    /**
     * The source of the image that will be displayed before the label of the switch.
     */
    imageSrc?: string;
}
/**
 * The toggle field that has deny state, allow state and inherit state.
 *
 * Only present in channel permissions.
 */
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
declare interface FieldDropdownProps extends FieldDefaultSpecs<OptionSpecs | any>, FieldHasOptions<OptionSpecs> {
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
    optionSubLabelRenderer?: (option: OptionSpecs) => ReactElement;
    useFuzzySort?: boolean;
    fuzzySortMaxResults?: number;
}
/**
 * The field that hides its options until it's clicked.
 */
declare interface FieldDropdownSpecs extends FieldRequiredSpecs<"Dropdown">, FieldDropdownProps {}
/**
 * The field that allows one option to be selected.
 *
 * Present in custom forms (normal version) and everywhere else (panel checkboxes).
 */
declare interface FieldRadioSpecs
    extends FieldSpecs<"Radios", { optionName: string | number | boolean }>,
        FieldHasOptions<OptionRadioSpecs> {
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
        [optionName: string]: any;
    };
}
/**
 * The field that allows multiple options to be selected.
 *
 * Present only in custom forms.
 * Everywhere else, Switch is used instead.
 */
declare interface FieldCheckboxesSpecs
    extends FieldSpecs<"Checkboxes", Array<{ optionName: string; value: boolean }>>,
        FieldHasOptions<OptionSpecs> {
    numColumns?: number;
}
/**
 * The field that acts as an icon dropdown.
 *
 * Present in emote picker menu (normal), event creation (color type).
 * Similar to dropdown, but doesn't have a border.
 */
declare interface FieldIconMenuSpecs extends FieldSpecs<"IconMenu", string>, FieldHasOptions<OptionSpecs> {
    /**
     * The type of the icon menu.
     * - If the type of this menu is `color`, then option values are colours that will be used as icons.
     * - If no type is given, then `iconName` in options will be used as icons.
     */
    iconType?: "color";
    isRemovable?: boolean;
    hideRemove?: boolean;
    menuPositioningClass?: string;
    usePortal?: boolean;
    /**
     * Where to align the portal.
     * @default "bottom-center"
     */
    portalAlignment?: "top-center";
    /**
     * The size of the icons in the icon menu.
     * @default "md"
     */
    iconSize?: Size;
}
/**
 * The field for doing an action upon pressing the button.
 */
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
     *
     * Success is only used in mobile version, while monochrome is never used and bleached is only used as hollow button.
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
/**
 * The field for getting the range between 2 dates and times.
 *
 * Present in event creation.
 */
declare interface FieldDateAndTimeRangeSpecs
    extends FieldSpecs<"DateAndTimeRange", { startMoment: Moment; endMoment: Moment }>,
        FieldBasics {
    allowPastValues?: boolean;
}
/**
 * The field for getting event repetition.
 *
 * Present in event creation.
 * This is a wrapper around another form using number and dropdown fields.
 */
declare interface FieldEventRepeatSpecs
    extends FieldSpecs<"EventRepeat", { repeatType: "once"; isValid: boolean }>,
        FieldBasics {
    defaultStartDate?: boolean;
}
/**
 * The field for getting specific day of the month and of the year.
 *
 * Present in date and time range field.
 * This will always hold a value.
 */
declare interface FieldDateSpecs extends FieldSpecs<"Date", Moment>, FieldBasics {
    hasError?: boolean;
    allowPastValues?: boolean;
}
/**
 * The field for getting hours and minutes.
 *
 * Present in date and time range field.
 */
declare interface FieldTimeSpecs extends FieldSpecs<"Time", number>, FieldBasics {
    showTimezone?: boolean;
    showInlineTimezone?: boolean;
    hasError?: boolean;
}
/**
 * The field for picking a colour.
 *
 * Present in role settings.
 * This does not have alpha channel available.
 */
declare interface FieldColorSpecs extends FieldSpecs<"Color", string>, FieldBasics {
    size?: Size;
    useLightColor?: boolean;
}
/**
 * The field for uploading images and avatars.
 *
 * Present in server settings, bot settings and webhook settings.
 */
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
/**
 * The field for getting the range with minimum and maximum value.
 */
declare interface FieldRangeSpecs extends FieldSpecs<"Range", { max: number; min?: number }>, FieldBasics {
    rangeType?: "gilded";
    size?: Size;
    isPanel?: boolean;
    /**
     * The function that will be used to display a label based on changed range value.
     * @example ({ min, max }) => `Members ${min}-${max}`
     */
    selectedValueFunction?: (value: { max: number; min?: number }) => string;
    details?: { max: number; min?: number };
    /**
     * Whether to allow only maximum number to be changed. If false, this makes range 2-way with 2 thumbs.
     * @default true
     */
    lockMinValue?: boolean;
    lockSliderMinToZero?: boolean;
    hideLabels?: boolean;
    maxTooltip?: string;
    steps?: number[];
    stepDetails?: { hasEmptyDefault?: boolean };
}
type KeybindValue = {
    id: string;
    keys: Array<{
        key: string;
        virtualKey: string;
    }>;
    entities: Array<OptionDropdownSpecs>;
};
/**
 * The field for setting keyboard keys for roles and users.
 *
 * Only present in voice settings.
 */
declare interface FieldItemKeybindsSpecs extends FieldSpecs<"ItemKeybinds", KeybindValue[]>, FieldBasics {
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
/**
 * The field for getting a set of keyboard keys.
 *
 * Only present in item keybinds.
 */
declare interface FieldHotkeySpecs extends FieldSpecs<"Hotkey", { keys: KeybindValue[] }> {}
declare interface FieldTableSpecs extends FieldSpecs<"Table", Array<{ optionName: string } & object>>, FieldBasics {
    rowInputType: string;
    emptyText: string;
    itemClass?: string;
    headerSpecs: Array<{ text: string; key: string } | Array<{ text: string; key: string }>>;
}
/**
 * The field that allows creating a custom form.
 *
 * Only present in event creation and tournament settings.
 */
declare interface FieldCustomFormSpecs extends FieldSpecs<"CustomForm", number> {
    /**
     * Whether the custom created form will always be public.
     */
    isAlwaysPublic?: boolean;
}
/**
 * The field that allows picking any emote.
 *
 * Only present in flow reaction action.
 */
declare interface FieldReactionSpecs extends FieldSpecs<"Reaction", number> {
    size?: Size;
}
//#endregion

//#region Option definitions
declare interface OptionBaseSpecs {
    optionName: string | number | boolean;
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
    renderOrnament: (option: { optionName: string; value: OptionTableSpecs & object }) => React.ReactNode;
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
    formSpecs: FormSpecs;
    onChange?: (state: FormOutput) => void;
};
export type FormValue = {
    /** Whether the form field's value has been changed. */
    hasChanged: boolean;
    /** Whether the value of the form field is valid. */
    isValid: boolean;
    /** The value of the form field. */
    value: any;
};
export type FormOutput<T extends {} = { [fieldName: string]: any }> = {
    /** Whether the form field values were changed. */
    hasChanged: boolean;
    /** The dictionary of changed fields with their values. */
    changedValues: Partial<T>;
    /** The dictionary of all fields with their values, including default values. */
    values: T;
    /** Whether all fields in the form are valid */
    isValid: boolean;
};

export declare class Form extends React.Component<FormProps> {
    constructor(props: FormProps, context?: any);

    get formValues(): { [fieldName: string]: FormValue };
    get values(): { [fieldName: string]: any };
    get changedValues(): { [fieldName: string]: any };
    get outputValues(): FormOutput;
}
//#endregion
