export declare interface Extension<T extends string | string[]> {
    id: string;
    name: string;
    files: T;
    dirname: string;

    author?: string;
    contributors?: string[];
    version?: string;
    repoUrl?: string;
    readme?: string;
}
export declare interface Theme extends Extension<string[]> {
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
export declare interface Addon extends Extension<string> {}
export type AnyExtension = Extension<string | string[]>;
