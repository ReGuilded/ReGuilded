import { ReGuildedExtensionSettings } from "../../../common/reguilded-settings";
import { AnyExtension } from "../../../common/extensions";
import { RGExtensionConfig } from "../../types/reguilded";
import SettingsHandler from "./settings";
import ReGuilded from "../ReGuilded";
import { AbstractEventTarget } from "./eventTarget";

/**
 * Manages different components of ReGuilded to allow them to be extended.
 */
export default abstract class ExtensionHandler<
    T extends AnyExtension,
    C extends RGExtensionConfig<T>,
    S extends ReGuildedExtensionSettings = ReGuildedExtensionSettings
> extends AbstractEventTarget {
    /**
     * A Regex pattern for determining whether given extension's ID is correct.
     */
    static idRegex: RegExp = /^[A-Za-z0-9]+$/g;
    static versionRegex = /^([0-9]+)(?:[.]([0-9]+))+(?:\-([Aa]lpha|[Bb]eta|[Gg]amma))?$/;

    all: T[];
    config: C;
    parent: ReGuilded;
    allLoaded: boolean;
    settingsHandler: SettingsHandler;
    settings: S;
    idsToMetadata: { [extensionId: string]: T };

    /**
     * Creates a new manager for any kind of extension.
     * @param parent The parent ReGuilded instance
     * @param settings The reference of extension settings manager
     * @param settingsHandler The extension settings handler
     * @param config The preload configuration of the extensions
     */
    constructor(parent: ReGuilded, settings: S, settingsHandler: SettingsHandler, config: C) {
        super();

        this.all = [];
        this.config = config;
        this.parent = parent;
        this.allLoaded = false;
        this.settings = settings;
        this.settingsHandler = settingsHandler;

        this.config.setDeletionCallback(this.deleteCallback.bind(this));
    }
    /**
     * Gets identifiers of all the enabled extensions.
     */
    get enabled(): string[] {
        return this.settings.enabled;
    }
    async init(): Promise<void> {
        this.config.setWatchCallback(this.watchCallback.bind(this));

        // Load the ones that were too early and were added before watch callback was set
        await Promise.all(
            this.config.getAll().map(extension => {
                try {
                    this.checkExtension(extension);

                    this.all.push(extension);
                    return ~this.enabled.indexOf(extension.id) && this.load;
                } catch (e) {
                    return Promise.reject(e);
                }
            })
        ).catch(e => console.error("Error loading an extension:", e));
    }
    /**
     * Loads the given extension.
     * @param extension The extension to load
     */
    abstract load(extension: T): Promise<void>;
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
                () => this.settingsHandler.settings.debugMode && console.log(`Deleted extension by ID '${extension.id}'`),
                e => console.error(`Failed to delete extension by ID '${extension.id}':\n`, e)
            );
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
     * Cleans up the extension after it has been deleted.
     * @param metadata The extension being deleted
     */
    protected deleteCallback(metadata: T) {
        // To not keep CSS or anything addon injected
        if (~this.enabled.indexOf(metadata.id)) this.unload(metadata);

        this.all.splice(
            this.all.findIndex(other => other.id === metadata.id),
            1
        );

        this.dispatchEvent(new ExtensionEvent("delete", metadata));
    }
    protected abstract watchCallback(metadata: T, loaded: boolean, previousId: string): Promise<void>;
    protected async _watchCallbackBase(metadata: T): Promise<void> {
        this.checkExtension(metadata);

        // Update its metadata
        const inAll = this.all.findIndex(other => other.dirname === metadata.dirname);
        if (~inAll) this.all.splice(inAll, 1);

        this.all.push(metadata);
        if (~this.enabled.indexOf(metadata.id)) await this.load(metadata);

        this.dispatchEvent(new ExtensionEvent("change", metadata));
    }

    /**
     * Checks if the identifier of the extension is correct or not.
     * @param id The identifier of the extension
     * @param path The path of the file
     * @throws {Error} Incorrect parameter `id` syntax
     * @returns Checks identifier's syntax
     */
    protected checkExtension(extension: T): void {
        const { id, version } = extension;

        if (!(typeof id === "string" && id.match(ExtensionHandler.idRegex)))
            throw new Error(`Incorrect syntax of the property 'id'`);
        else if (version && !(typeof version === "string" && this.versionFormatIsFine(extension, version))) {
            console.warn(
                `The property 'version' must be a number array with optionally last string or have "rolling" as a value — Extension by ID '${extension.id}'`
            );
            extension.version = extension._versionMatches = undefined;
        }
    }
    /**
     * Checks if the format of the version is fine.
     * @param extension The extension to check version of
     * @param version The version of the extension
     * @returns >0 if the format is fine
     */
    private versionFormatIsFine(extension: T, version: string): number {
        let versionMatch = version.match(ExtensionHandler.versionRegex);

        return versionMatch && (extension._versionMatches = versionMatch.slice(1)).length;
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
            throw new TypeError(
                `Expected '${name}' to be [${types.join(", ")}], found ${typeof value} instead in ${path}`
            );
    }
}
export class ExtensionEvent<T extends AnyExtension> extends Event {
    public extension: T;
    constructor(type: string, extension: T) {
        super(type, { cancelable: false });

        this.extension = extension;
    }
}
