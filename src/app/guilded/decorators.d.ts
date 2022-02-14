import { ModalV2Props } from "./components/modals";
import { FormOutput, FormSpecs } from "./form";

//#region General
/**
 * Defines a type mixin that adds additional properties.
 */
export type TypeMixin<P extends {}> = <T>(constructor: T) => T;

// export type TypeMixin<P extends {}> = <I, A extends Array<any>, T extends new (args: A) => I>(
//     constructor: T
// ) => new (...args: A) => I & P;

//#endregion

//#region OverlayProvider
export type ModalOutput = { confirmed: boolean };

type DefinedOverlay<P, R> = {
    Open: (properties: P) => Promise<R>;
};
export type ProvidedOverlay<T> = T extends "SimpleFormOverlay"
    ? DefinedOverlay<ModalV2Props & { formSpecs: FormSpecs }, FormOutput & ModalOutput>
    : T extends "DeleteConfirmationOverlay"
    ? DefinedOverlay<{ name: string }, ModalOutput>
    : T extends "SimpleConfirmationOverlay"
    ? DefinedOverlay<ModalV2Props & { text: string }, ModalOutput>
    : never;

export type OverlayProvider = <O extends string>(overlays: O[]) => TypeMixin<{ [Overlay in O]: ProvidedOverlay<Overlay> }>;
//#endregion
