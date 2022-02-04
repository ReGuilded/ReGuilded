import React from "react";
import { Size } from "./common";

type SearchBarV2Props = {
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
};
export declare class SearchBarV2 extends React.Component<SearchBarV2Props> {
    /**
     * The element that is used as an input.
     */
    get _inputRef(): Element;
    /**
     * Whether the searchbar is focused or not.
     */
    get isFocused(): boolean;
}
export type ButtonType = "gilded" | "delete" | "success" | "monochrome" | "bleached" | "white" | "whiteBg" | "stripe";
export declare class Button extends React.Component {
    constructor(
        props: {
            href?: string;
            onClick?: (e: MouseEvent) => void;

            // Tooltip for disabled button
            disabled?: boolean;
            disabledTooltip?: boolean;
            disabledTooltipDirection?: "left" | "right";
        },
        context?: object
    );
    /**
     * Whether to use context when hovering.
     */
    get useHoverContext(): boolean;
    get Component(): React.Component;
    get componentProps(): object;
}
