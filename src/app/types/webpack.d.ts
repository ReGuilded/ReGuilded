export type WebpackExports = {
    /** The identifier of the module. */
    i: number | string;
    /** Whether it's ES module or not. */
    l: boolean;
    /** The exports of the module. */
    exports: any | void;
};

export type WebpackRequire = ((moduleId: number) => any) & {
    /** Breadcrumb for fetching bundles. */
    p: RegExp;
    /** The list of current fetched Webpack modules. */
    m: WebpackModule[];
    /** The list of fetched module exports. */
    c: { [moduleId: number]: WebpackExports };
};

export type WebpackModule = (module: { exports: {} }, exports: {}, require: WebpackRequire) => void;

export type WebpackBundle = [
    /** The identifier of the Webpack bundle. */
    [number],
    /** Exported modules. */
    { [moduleId: number | string]: WebpackModule },

    []?,
    /** Required bundles. */
    [string]?
];

export type WebpackJsonp = Array<WebpackBundle> & {
    /**
     * Either unpatched push or ReGuilded patched push.
     */
    push: (bundle: WebpackBundle) => number;
    /**
     * Unpatched push.
     */
    _push: (bundle: WebpackBundle) => number;
};

declare global {
    interface Window {
        webpackJsonp: WebpackJsonp;
    }
}
