import ExtensionManager, { Extension } from "./extension.js";
import { existsSync, readFile, writeFile } from "fs";
import { join, isAbsolute } from "path";

declare class Theme extends Extension<string[]> {
    settingsProps: string[];
    settings: {
        [id: string]: {
            name?: string,
            type?: "url" | "size" | "color" | "number" | "percent" | undefined | null,
            value?: string | boolean | number | undefined
        }
    }
}

/**
 * Manager that manages ReGuilded's themes
 */
export default class ThemesManager extends ExtensionManager<Theme> {
    static allowedSettingsTypes = [
        undefined,
        null,
        "url",
        "size",
        "color",
        "number",
        "percent"
    ];
    static allowedSettingsValues = [
        "string",
        "boolean",
        "number",
        "undefined"
    ];
    megaGroup?: Element;
    /**
     * Manager that manages ReGuilded's themes
     * @param themesDir The directory of the ReGuilded themes
     */
    constructor(themesDir: string) {
        super(themesDir);
    }
    /**
     * Initiates themes for ReGuilded and theme manager.
     * @param enabled An array of enabled themes.
     */
    init(enabled: string[] = []) {
        console.log("Initiating theme manager");

        // Make sure <datagroup> elements are ignored
        this.megaGroup = document.createElement("datagroup");
        this.megaGroup.id = "reGl-main";

        this.megaGroup.appendChild(
            Object.assign(document.createElement("styles"), {
                id: "reGl-datagroup",
                innerHTML: "datagroup{display:none;}"
            })
        );
        document.body.appendChild(this.megaGroup);

        // Initialize these here instead of getDirs()
        this.all = [];
        this.enabled = enabled;

        this.watch((_, loaded, metadata: Theme) => new Promise((resolve, reject) => {
            // If the theme is already loaded, unload it
            loaded && this.unload(metadata);
            // If the theme is in the list of all themes, remove it
            ~this.all.indexOf(metadata) && this.all.splice(this.all.indexOf(metadata, 1));

            const propFiles = typeof metadata.files === "string" ? [metadata.files] : metadata.files;
            metadata.files = propFiles;

            // Since we turned string into single-item array,
            // we don't need to check for both types
            if (!Array.isArray(propFiles))
                return reject(new TypeError(`Expected property 'files' to be either a string or an array. In path: ${metadata.dirname}`));

            for (let file of propFiles) {
                const filePath = getCssPath(metadata, file);

                if (!existsSync(filePath))
                    return reject(new Error(`Could not find CSS file in path ${filePath}`));
            }


            // If Enabled; Load the theme and add it to loaded dictionary
            if (this.enabled.includes(metadata.id))
                this.load(metadata);

            // Add theme to all array.
            this.all.push(metadata);
            
            resolve(metadata);
        }));
    }

    /**
     * Loads a ReGuilded theme
     * @param metadata ReGuilded theme to load
     */
    load(metadata: Theme) {
        console.log(`Loading theme by ID '${metadata.id}'`);
        
        // Creates a new style group element for that theme
        const group = Object.assign(document.createElement("datagroup"), {
            id: `reGl-theme-${metadata.id}`,
            classList: "reGl-theme"
        });

        this.checkAndDoSettings(metadata, group);
        
        // Add all CSS files to the group
        for (let file of metadata.files)
            readFile(getCssPath(metadata, file), { encoding: 'utf8' }, (err, css) => {
                if (err) throw err;
                
                group.appendChild(
                    Object.assign(document.createElement("style"), {
                        classList: "reGl-css-theme",
                        innerHTML: css
                    })
                );
            });
        
        this.megaGroup.appendChild(group);
    }
    
    /**
     * Creates settings properties for the theme if they are present.
     * @param metadata Theme metadata
     * @param group The datagroup element of the theme
     */
    checkAndDoSettings(metadata: Theme, group: Element) {
        readFile(join(metadata.dirname, "settings.json"), { encoding: 'utf-8' }, (err, file) => {
            // Why check if err exists 2 times if you can make horrible looking nested IFs
            if (err)
                if (err.code === "ENOENT") return;
                else return console.error('Error in theme', metadata.id, ':\n', err);

            const json = JSON.parse(file);

            if (typeof json !== "object")
            return console.warn("Expected theme settings to be of type 'object' in theme", metadata.id);

            const props = Object.keys(json);
            // Using keys instead of values to validate id as well
            for (let propId of props) {
                // Validate ID
                if (!propId.match(ExtensionManager.idRegex))
                    return console.warn("Incorrect syntax for property", propId, ". Theme ID:", metadata.id);

                const prop = json[propId];
                if (typeof prop !== "object")
                    return console.warn("Expected theme settings property", propId, "to be of type 'object'. Theme ID:", metadata.id);

                if (!prop.name)
                prop.name = propId;

                // Validate property's type (not JS type)
                if (!~ThemesManager.allowedSettingsTypes.indexOf(prop.type)) {
                    console.warn("Unknown settings property type", prop.type, "in theme", metadata.id);
                    prop.type = undefined;
                }
                // Check value's type
                const valueType = typeof prop.value;
                if (!~ThemesManager.allowedSettingsValues.indexOf(valueType)) {
                    console.warn("Unknown settings property value type", valueType, "in theme", metadata.id);
                    prop.value = prop.value.toString();
                }
            }
            metadata.settings = json;
            metadata.settingsProps = props;
            group.appendChild(
                Object.assign(document.createElement("style"), {
                    id: `reGl-variables-${metadata.id}`,
                    // #app { --a: b; --c: d }
                    innerHTML: `#app{${metadata.settingsProps.map(id => {
                        const prop = metadata.settings[id];
                        // If it's of type url, wrap it in url(...)
                        // --id:value
                        // --id:url(value)
                        return `--${id}:${(prop.type === "url" ? `url(${prop.value})` : prop.value)}`
                    }).join(";")}}`
                })
            );
        });
    }
    /**
     * Assigns properties to theme settings.
     * @param metadata Theme metadata
     * @param props Theme settings properties 
     */
    assignProperties(metadata: Theme, props: { [prop: string]: string | number | boolean }) {
        for(let key of Object.keys(props))
            metadata.settings[key].value = props[key];
        
        // Write it and let the watcher update the theme
        writeFile(join(metadata.dirname, "settings.json"), JSON.stringify(metadata.settings), { encoding: "utf8" }, err => {
            if (err) throw err;
        });
    }
    
    /**
     * Unloads a ReGuilded theme.
     * @param metadata ID of the theme to unload from Guilded.
     */
    unload(metadata: Theme) {
        console.log(`Unloading theme by ID '${metadata.id}'`);

        const themeElement = document.getElementById(`reGl-theme-${metadata.id}`);
        themeElement && themeElement.remove();
    }

    /**
     * Checks if given theme based on ID is loaded.
     * @param id The identifier of the theme
     * @returns Theme is loaded
     */
    isLoaded(id: string): boolean {
        return this.enabled.includes(id);
    }
};
/**
 * Gets CSS path relative to the given theme.
 * @param theme The parent theme of used CSS file.
 * @param css The path to CSS file.
 * @returns Absolute path
 */
function getCssPath(theme: Theme, css: string): string {
    return isAbsolute(css) ? css : join(theme.dirname, css)
}
