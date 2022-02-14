import { promises as fsPromises, readFile, writeFile } from "fs";
import { isAbsolute, join, resolve as pathResolve } from "path";
import EnhancementManager from "./enhancement-manager";
import { Theme } from "../common/enhancements";

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
    setThemeSettings(themeId: string, props: { [settingsProp: string]: string | number | boolean | undefined }) {
        const metadata = this.idsToMetadata[themeId];

        if (!metadata) throw new Error(`Theme by ID '${themeId}' does not exist.`);

        if (typeof props !== "object") throw new TypeError("Expected 'setThemeSettings' second argument to be object.");

        for (let prop in props) metadata.settings[prop].value = props[prop];

        // Write file and let the watcher update the theme
        writeFile(join(metadata.dirname, "settings.json"), JSON.stringify(metadata.settings), e => {
            if (e) console.error(e);
        });
    }
    protected override async onFileChange(metadata: Theme): Promise<void> {
        const files = typeof metadata.files === "string" ? [metadata.files] : metadata.files;

        await Promise.all([
            // CSS files
            Promise.all(files.map(file => fsPromises.readFile(pathResolve(metadata.dirname, file), "utf8")))
                .then(styleSheets => (metadata.css = styleSheets))
                .catch(e => console.error("Failed to get CSS file", e)),
            // Settings file
            fsPromises
                .readFile(join(metadata.dirname, "settings.json"), "utf8")
                .then(d => {
                    let settings = JSON.parse(d);

                    // Validate settings
                    if (typeof settings !== "object")
                        throw new TypeError(
                            `Expected theme by ID '${metadata.id}' to have object at the root of settings.json.`
                        );
                    else metadata.settingsProps = Object.keys((metadata.settings = settings));
                })
                .catch(e => {
                    if (e.code !== "ENOENT")
                        console.error("Error while fetching settings of theme by ID '%s'", metadata.id, e);
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
