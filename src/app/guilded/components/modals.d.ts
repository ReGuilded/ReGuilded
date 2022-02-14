import React from "react";
import { ComponentText, Direction } from "../common";
import { ButtonType } from "../input";

//#region Modal
export declare interface ModalV2Props {
    /**
     * The header text of the modal.
     */
    header?: string;
    /**
     * Defines specifications for the header icon.
     */
    headerIconInfo?: {
        type: "back" | "svg" | "image";
        value?: string;
        /**
         * @default "default"
         */
        flavor?: "default" | string;
        onClick?: () => void | PromiseLike<void>;
    };
    /**
     * The text of the confirmation button.
     * @default "Confirm"
     */
    confirmText?: ComponentText;
    /**
     * The text of the cancelation button.
     * @default "Cancel"
     */
    cancelText?: ComponentText;
    /**
     * The text of the secondary button next to the confirmation button.
     * @default "Secondary action"
     */
    secondaryActionText?: ComponentText;
    /**
     * The button type of the confirmation button.
     * @default "gilded"
     */
    confirmType?: ButtonType;
    /**
     * The configuration of the modal buttons.
     * @default "ConfirmAndCancel"
     */
    controlConfiguration?:
        | "Confirm"
        | "Cancel"
        | "ConfirmAndCancel"
        | "BackArrow"
        | "BackNoTitle"
        | "ConfirmAndBackArrow"
        | "ConfirmAndBackSubtle"
        | "ConfirmAndBackIcon"
        | "ConfirmAndBackSpread";

    /**
     * Whether the confirmation button is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * The text to display if the confirmation button is disabled.
     */
    disabledTooltip?: ComponentText;
    /**
     * The direction where the tooltip will appear relative to the confirmation button.
     */
    disabledTooltipDirection?: Direction;
    onConfirm?: () => void | PromiseLike<void>;
    onClose?: () => void | PromiseLike<void>;
    onCancel?: () => void | PromiseLike<void>;
    onSecondaryAction?: () => void | PromiseLike<void>;

    paddingStyle?: string;
    borderStyle?: string;
    /**
     * Whether to remove the border between the header and the content of the modal.
     */
    isHeaderUniform?: boolean;
    /**
     * @default false
     */
    isRequired?: boolean;
    /**
     * Whether the modal takes up the whole screen, like settings.
     * @default false
     */
    isFullScreen?: boolean;
    isFullWidth?: boolean;
    isSmallWidth?: boolean;
}
export declare class ModalV2 extends React.Component<ModalV2Props> {
    get hasConfirm(): boolean;
    get isConfirmOnly(): boolean;
    get isCancelOnly(): boolean;
}
//#endregion
