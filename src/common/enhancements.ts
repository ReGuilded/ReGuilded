export declare interface Enhancement<T extends string | string[]> {
    id: string;
    name: string;
    files: T;
    dirname: string;

    author?: string;
    contributors?: string[];
    version?: string;
    _versionMatches?: string[];
    repoUrl?: string;
    banner?: string;
    images?: string[];
    readme?: string;
}
export declare interface Theme extends Enhancement<string[]> {
    /**
     * The list of CSS content of this theme.
     */
    css: string[];
    /**
     * The settings of the theme.
     */
    settings: {
        [id: string]: {
            name?: string;
            type?: "url" | "size" | "color" | "number" | "percent" | undefined | null;
            value?: string | number | boolean | undefined | null;
        };
    };
    /**
     * The list of `settings` properties.
     */
    settingsProps: string[];
}
export type AddonExports = {
    load: () => any;
    init?: () => any;
    unload?: () => any;
    [otherExport: string]: any;
};
export declare interface Addon extends Enhancement<string> {
    requiredPermissions: number;
    execute: (importable: (path: string) => [boolean, any?]) => Promise<AddonExports>;
    exports?: AddonExports;

    _error?: Error | string;
}
export type AnyEnhancement = Enhancement<string | string[]>;
