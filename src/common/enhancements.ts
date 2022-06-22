export declare interface Enhancement<T, S extends {}> {
    id: string;
    name: string;
    files: T;
    dirname: string;

    subtitle?: string;
    readme?: string;
    repoUrl?: string;

    icon?: string;
    banner?: string;
    images?: string[];

    author?: string;
    contributors?: string[];
    version?: string;

    // Private
    _versionMatches?: string[];
    _repoInfo?: {
        platform: string;
        path: string;
    };
    _state?: S;
}

export type ThemeCssVariableType = string | number | undefined | null;
export type ThemeSettings = {
    [id: string]: {
        name?: string;
        type?: "url" | "size" | "color" | "number" | "percent" | undefined | null;
        value?: ThemeCssVariableType;
        options?: Array<{
            name: string;
            value: ThemeCssVariableType;
        }>;
        _optionValue?: ThemeCssVariableType;
    };
};

export declare interface Theme extends Enhancement<string[], { settings: { [name: string]: ThemeCssVariableType } }> {
    /**
     * The list of CSS content of this theme.
     */
    css: string[];
    /**
     * The settings of the theme.
     */
    settings?: ThemeSettings;
    /**
     * The list of `settings` properties.
     */
    _settingsProps?: string[];

    extensions?: Array<ThemeExtension>;
}

export declare interface ThemeExtension {
    id: string;
    name?: string;
    description?: string;
    file: string;
    css: string;
}

export type AddonExports = {
    load: () => any;
    init?: () => any;
    unload?: () => any;
    [otherExport: string]: any;
};
export declare interface Addon extends Enhancement<string, {}> {
    requiredPermissions: number;
    execute: (importable: (path: string) => [boolean, any?]) => Promise<AddonExports>;
    exports?: AddonExports;

    _error?: Error | string;
    _missingPerms?: number;
}
export type AnyEnhancement = Enhancement<any, any>;
