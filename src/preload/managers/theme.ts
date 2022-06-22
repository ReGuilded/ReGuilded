import { promises as fsPromises, readFile, writeFile } from "fs";
import { isAbsolute, join, resolve as pathResolve } from "path";
import EnhancementManager from "./enhancement";
import { Theme, ThemeCssVariableType } from "../../common/enhancements";
import { fetchCss } from "../util";

// TODO: Checking
export default class ThemeManager extends EnhancementManager<Theme> {
    constructor(dirname: string) {
        super("theme", dirname);

        this.exportable.setThemeSettings = this.setThemeSettings.bind(this);
    }
    /**
     * Sets the new theme settings value properties.
     * @param themeId The name of the theme
     * @param props The settings property values
     */
    setThemeSettings(themeId: string, props: { [settingsProp: string]: ThemeCssVariableType }) {
        const metadata = this.idsToMetadata[themeId];

        if (!metadata) throw new Error(`Theme by ID '${themeId}' does not exist.`);

        if (typeof props != "object") throw new TypeError("Expected 'setThemeSettings' second argument to be object.");

        for (let prop in props) metadata.settings[prop].value = props[prop];

        // Write file and let the watcher update the theme
        writeFile(join(metadata.dirname, "settings.json"), JSON.stringify(metadata.settings), e => {
            if (e) console.error(e);
        });
    }
    protected override async onFileChange(metadata: Theme): Promise<void> {
        const { dirname: themesDirname } = metadata;

        const files = typeof metadata.files == "string" ? [metadata.files] : metadata.files;

        await Promise.all([
            // CSS files
            Promise.all(files.map(file => fetchCss(themesDirname, file)))
                .then(styleSheets => (metadata.css = styleSheets))
                .catch(e => console.error("Failed to get CSS file:", e)),
            // Extension CSS files
            new Promise<void>(async (resolve, reject) => {
                const { extensions } = metadata;

                if (extensions == null) resolve();
                // Easier to handle arrays than objects
                else if (Array.isArray(extensions)) {
                    for (const extension of metadata.extensions) {
                        // Ensure types
                        if (typeof extension != "object")
                            return reject(new TypeError(`Expected all items in metadata.extensions array to be objects`));
                        else if (typeof extension.file != "string")
                            return reject(new TypeError(`Expected metadata.extensions[i].file to be a string`));

                        await fetchCss(themesDirname, extension.file)
                            .then(content => void (extension.css = content))
                            .then(resolve);
                    }
                } else reject(new TypeError(`Expected to have metadata.extensions as an array or undefined`));
            }).catch(e => {
                console.error("Error while fetching extensions of theme by ID '%s':\n", metadata.id, e);
                metadata.extensions = null;
            }),
            // Settings file
            fsPromises
                .readFile(join(themesDirname, "settings.json"), "utf8")
                .then(d => {
                    let settings = JSON.parse(d);

                    // Validate settings
                    if (typeof settings != "object")
                        throw new TypeError(`Expected to have object at the root of settings.json`);

                    metadata.settings = settings;
                })
                .catch(e => {
                    if (e.code != "ENOENT")
                        console.error("Error while fetching settings of theme by ID '%s':\n", metadata.id, e);
                })
        ]);
    }
    /**
     * Gets the absolute path to the CSS file.
     * @param themePath The path to the theme's directory
     * @param cssPath The path to the CSS file
     * @returns The absolute path to CSS file
     */
    static getCssPath(themePath: string, cssPath: string) {
        return isAbsolute(cssPath) ? cssPath : join(themePath, cssPath);
    }
}
