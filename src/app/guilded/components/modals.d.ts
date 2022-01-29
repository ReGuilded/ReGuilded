import { ButtonType } from "../input";

export declare interface ModalProps {
    header?: string;
    confirmText?: string;
    confirmType?: ButtonType;
    controlConfiguration?: "Confirm" | "ConfirmAndCancel";
}
