import { ReGuildedExtensionSettings } from "../../../common/reguilded-settings";
import { AnyExtension } from "../../../common/extensions";
import { RGExtensionConfig } from "../../types/reguilded";
import SettingsHandler from "./settings";

/**
 * Manages different components of ReGuilded to allow them to be extended.
 */
export default abstract class ExtensionHandler<T extends AnyExtension, C extends RGExtensionConfig<T>> {
    static allowedReadmeName: string = "readme.md";
    /**
     * A Regex pattern for determining whether given extension's ID is correct.
     */
    static idRegex: RegExp = /^[A-Za-z0-9]+$/g;

    all?: T[];
    config: C;
    allLoaded: boolean;
    settingsHandler: SettingsHandler;
    settings: ReGuildedExtensionSettings;
    idsToMetadata: { [extensionId: string]: T };
    /**
     * Manages different components of ReGuilded to allow them to be extended.
     * @param settings The reference of extension settings manager
     * @param settingsHandler The extension settings handler
     * @param config The preload configuration of the extensions
     */
    constructor(settings: ReGuildedExtensionSettings, settingsHandler: SettingsHandler, config: C) {
        this.config = config;
        this.allLoaded = false;
        this.settings = settings;
        this.settingsHandler = settingsHandler;
    }
    /**
     * Gets identifiers of all the enabled extensions.
     */
    get enabled(): string[] {
        return this.settings.enabled;
    }
    /**
     * Loads the given extension.
     * @param extension The extension to load
     */
    abstract load(extension: T): void;
    /**
     * Unloads the given extension.
     * @param extension The extension to unload
     */
    abstract unload(extension: T): void;
    /**
     * Deletes the given extension.
     * @param extension Extension to delete
     */
    async delete(extension: T): Promise<void> {
        // Unload to not bug it out
        this.savedUnload(extension)
            .then(() => this.config.delete(extension.id))
            .then(
                () => console.log(`Deleted extension by ID '${extension.id}'`),
                e => console.error(`Failed to delete extension by ID '${extension.id}':\n`, e)
            );
    }
    /**
     * Checks if the identifier of the extension is correct or not.
     * @param id The identifier of the extension
     * @param path The path of the file
     * @throws {Error} Incorrect parameter `id` syntax
     * @returns Checks identifier's syntax
     */
    static checkId(id: any, path: string): void {
        if (!(typeof id === "string" && id.match(ExtensionHandler.idRegex))) throw new Error(`Incorrect syntax of the property 'id'. Path: ${path}`);
    }

    /**
     * Loads all ReGuilded extensions onto Guilded.
     */
    loadAll(): void {
        for (let ext of this.enabled) {
            const extension = this.all.find(x => x.id === ext);

            if (extension) this.load(extension);
        }
    }
    /**
     * Loads the given extension and then saves the enabled state in the settings.
     * @param extension The extension to load
     */
    async savedLoad(extension: T): Promise<void> {
        this.load(extension);
        this.settings.enabled.push(extension.id);
        await this.settingsHandler.save();
    }
    /**
     * Removes ReGuilded themes from Guilded.
     */
    unloadAll(): void {
        // Unload all existing extensions
        for (let ext of this.all) {
            if (~this.enabled.indexOf(ext.id)) this.unload(ext);
        }
    }
    /**
     * Unloads the given extension and then saves the disabled state in the settings.
     * @param extension The extension to unload
     */
    async savedUnload(extension: T): Promise<void> {
        this.unload(extension);
        this.settings.enabled = this.settings.enabled.filter(extId => extId != extension.id);
        await this.settingsHandler.save();
    }
    /**
     * Checks if property is given type and if it isn't, throws an error.
     * @param name The name of the property.
     * @param value The value of the property.
     * @param types Expected types of the property.
     * @param path Path to the JSON where property is.
     */
    static checkProperty(name: string, value: any, types: [string | Function], path: string) {
        if (types.includes(typeof value) && types.some(x => x instanceof Function && value instanceof x))
            throw new TypeError(`Expected '${name}' to be [${types.join(", ")}], found ${typeof value} instead in ${path}`);
    }
}
