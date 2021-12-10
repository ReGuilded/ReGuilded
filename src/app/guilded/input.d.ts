import React from "react";

export declare class SearchBar extends React.Component {
    constructor(props: {
        className?: string,
        placeholder: string,
        autoComplete: "on" | "off",
        onChange: () => void,
        onEnterPressed: () => void,
        onEscapePressed: () => void,
    }, context?: object);
    /**
     * The element that is used as an input.
     */
    get _inputRef(): Element;
    /**
     * Whether the searchbar is focused or not.
     */
    get isFocused(): boolean;
}
export declare class Button extends React.Component {
    constructor(props: {
        href?: string,
        onClick?: (e: MouseEvent) => void,

        // Tooltip for disabled button
        disabled?: boolean,
        disabledTooltip?: boolean,
        disabledTooltipDirection?: "left" | "right",
    }, context?: object);
    /**
     * Whether to use context when hovering.
     */
    get useHoverContext(): boolean;
    get Component(): React.Component;
    get componentProps(): object;
}