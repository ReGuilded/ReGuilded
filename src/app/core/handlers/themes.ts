import { ReGuildedEnhancementSettings, ReGuildedSettings } from "../../../common/reguilded-settings.js";
import { RGThemeConfig } from "../../types/reguilded.js";
import { Theme } from "../../../common/enhancements.js";
import EnhancementHandler from "./enhancement.js";
import ReGuilded from "../ReGuilded.js";
import ConfigHandler from "./config.js";

/**
 * Manager that manages ReGuilded's themes
 */
export default class ThemeHandler extends EnhancementHandler<Theme, RGThemeConfig> {
    static allowedSettingsTypes = [undefined, null, "url", "size", "color", "number", "percent"];
    static allowedSettingsValues = ["string", "boolean", "number", "undefined"];
    megaGroup?: Element;
    //idsToCss: { [enhancementId: string]: string[] };
    /**
     * Manager that manages ReGuilded's themes
     * @param parent The parent ReGuilded instance
     * @param themesDir The directory of the ReGuilded themes
     * @param settings The settings of the themes
     * @param settingsHandler The enhancement settings handler
     * @param config The preload config for themes
     */
    constructor(
        parent: ReGuilded,
        settings: ReGuildedEnhancementSettings,
        settingsHandler: ConfigHandler<ReGuildedSettings>,
        config: RGThemeConfig
    ) {
        super(parent, settings, settingsHandler, config);
    }
    /**
     * Initiates themes for ReGuilded and theme manager.
     */
    async init(): Promise<void> {
        this.settingsHandler.config.debugMode && console.log("Initiating theme manager");

        // For themes
        this.parent.styling.appendChild(
            (this.megaGroup = Object.assign(document.createElement("datagroup"), {
                id: "ReGuildedStyle-themes"
            }))
        );

        await super.init();
    }
    protected override async watchCallback(metadata: Theme, loaded: boolean, previousId: string): Promise<void> {
        const currentOrPreviousId = previousId || metadata.id;
        // Since we already have it loaded, we need to update it and unload
        if (loaded && ~this.enabled.indexOf(currentOrPreviousId)) this.unloadWithId(currentOrPreviousId);

        const propFiles = typeof metadata.files == "string" ? [metadata.files] : metadata.files;
        metadata.files = propFiles;

        if (metadata.settings) metadata._settingsProps = Object.keys(metadata.settings);

        // Since we turned string into single-item array,
        // we don't need to check for both types
        if (!Array.isArray(propFiles))
            return console.error(
                new TypeError(`Expected property 'files' to be either a string or an array. In path: ${metadata.dirname}`)
            );

        await super._watchCallbackBase(metadata, currentOrPreviousId);
    }
    /**
     * Loads a ReGuilded theme
     * @param metadata The ReGuilded theme to load
     */
    async load(metadata: Theme): Promise<void> {
        this.settingsHandler.config.debugMode && console.log(`Loading theme by ID '${metadata.id}'`);

        await this.addStyleSheets(metadata);
    }
    async addStyleSheets(metadata: Theme) {
        // Creates a new style group element for that theme
        const group = Object.assign(document.createElement("datagroup"), {
            id: `ReGuildedStyleTheme-theme-${metadata.id}`,
            classList: "ReGuildedStyle-theme"
        });

        this.checkAndDoSettings(metadata, group);

        for (let css of metadata.css)
            group.appendChild(
                Object.assign(document.createElement("style"), {
                    classList: "ReGuildedStyleTheme-css",
                    innerHTML: css
                })
            );

        this.megaGroup.appendChild(group);
    }

    /**
     * Creates settings properties for the theme if they are present.
     * @param metadata Theme metadata
     * @param group The datagroup element of the theme
     */
    async checkAndDoSettings(metadata: Theme, group: Element) {
        return await Promise.all([
            // Settings
            new Promise<void>((resolve, reject) => {
                if (!metadata.settings) return resolve();

                // Using keys instead of values to validate id as well
                for (let propId of metadata._settingsProps) {
                    // Validate ID
                    if (!propId.match(EnhancementHandler.idRegex))
                        return reject(`Incorrect syntax of the name of the property '${propId}'`);

                    const prop = metadata.settings[propId];

                    if (typeof prop != "object") return reject(`Expected property '${propId}' to be of type 'object'`);

                    if (!prop.name) prop.name = propId;

                    // Validate property's type (not JS type)
                    if (!~ThemeHandler.allowedSettingsTypes.indexOf(prop.type))
                        return reject(`Unknown settings property type ${prop.type}`);

                    // Check value's type
                    const valueType = typeof prop.value;

                    if (!~ThemeHandler.allowedSettingsValues.indexOf(valueType))
                        return reject(`Unknown settings property value type ${valueType}`);

                    if (Array.isArray(prop.options)) {
                        const selectedOption = prop.options[prop.value as number];

                        if (!selectedOption)
                            return reject(`Could not index settings[x].options item based on given settings[x].value`);

                        prop._optionValue = selectedOption.value;
                    } else if (prop.options != undefined) return reject(`Expected settings[x].options to be an array`);
                }

                // If warnings instead of rejections get reimplemented, make sure to not use
                // _settingsProps or use copy of it with removed invalid properties
                group.appendChild(
                    Object.assign(document.createElement("style"), {
                        id: "ReGuildedStyleTheme-settings",
                        // #app { --a: b; --c: d }
                        innerHTML: `#app{${metadata._settingsProps
                            .map(id => {
                                const prop = metadata.settings[id];
                                const propValue = prop._optionValue || prop.value;
                                // If it's of type url, wrap it in url(...)
                                // --id:value
                                // --id:url(value)
                                return `--${id}:${prop.type == "url" ? `url(${propValue})` : propValue}`;
                            })
                            .join(";")}}`
                    })
                );
                resolve();
            }).catch(error => console.error("Failed to do settings of the theme by ID '%s':", metadata.id, error)),
            // Extensions
            new Promise<void>((resolve, reject) => {
                if (!metadata.extensions) return resolve();

                for (const extension of metadata.extensions) {
                    // TODO: Extensions client-sided, extension sub-tab in theme pages
                    resolve();
                }
            })
        ]);
    }
    /**
     * Assigns properties to theme settings.
     * @param metadata Theme metadata
     * @param props Theme settings properties
     */
    assignProperties(metadata: Theme, props: { [prop: string]: string | number | boolean }) {
        this.config.setThemeSettings(metadata.id, props);
    }

    /**
     * Unloads a ReGuilded theme.
     * @param metadata ID of the theme to unload from Guilded.
     */
    unload(metadata: Theme) {
        this.unloadWithId(metadata.id);
    }
    private unloadWithId(themeId: string) {
        this.settingsHandler.config.debugMode && console.log(`Unloading theme by ID '${themeId}'`);

        const themeElement = document.getElementById(`ReGuildedStyleTheme-theme-${themeId}`);
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
}
