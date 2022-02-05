import { ReactNode } from "react";

export type Size = "xl" | "lg" | "md" | "sm" | "xsm";
export type Alignment = "vertical" | "horizontal";
export type Direction = "up" | "down";
/**
 * This should typically be a string, but using elements in it does not lead to errors.
 *
 * It is recommended to use string here most of the time, unless it is really necessary.
 */
export type ComponentText = ReactNode | ReactNode[];
