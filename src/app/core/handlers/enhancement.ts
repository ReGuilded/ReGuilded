import { ReGuildedEnhancementSettings } from "../../../common/reguilded-settings";
import { AnyEnhancement } from "../../../common/enhancements";
import { RGEnhancementConfig } from "../../types/reguilded";
import SettingsHandler from "./settings";
import ReGuilded from "../ReGuilded";
import { AbstractEventTarget } from "./eventTarget";

/**
 * Manages different components of ReGuilded to allow them to be extended.
 */
export default abstract class EnhancementHandler<
    T extends AnyEnhancement,
    C extends RGEnhancementConfig<T>,
    S extends ReGuildedEnhancementSettings = ReGuildedEnhancementSettings
> extends AbstractEventTarget {
    /**
     * A Regex pattern for determining whether given enhancement's ID is correct.
     */
    static idRegex: RegExp = /^[A-Za-z0-9]+$/g;
    static versionRegex = /^([0-9]+)(?:[.]([0-9]+))+(?:\-([Aa]lpha|[Bb]eta|[Gg]amma))?$/;

    all: T[];
    config: C;
    parent: ReGuilded;
    allLoaded: boolean;
    settingsHandler: SettingsHandler;
    settings: S;
    idsToMetadata: { [enhancementId: string]: T };

    /**
     * Creates a new manager for any kind of enhancement.
     * @param parent The parent ReGuilded instance
     * @param settings The reference of enhancement settings manager
     * @param settingsHandler The enhancement settings handler
     * @param config The preload configuration of the enhancements
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
     * Gets identifiers of all the enabled enhancements.
     */
    get enabled(): string[] {
        return this.settings.enabled;
    }
    async init(): Promise<void> {
        this.config.setWatchCallback(this.watchCallback.bind(this));

        // Load the ones that were too early and were added before watch callback was set
        await Promise.all(
            this.config.getAll().map(enhancement => {
                try {
                    this.checkEnhancement(enhancement);

                    this.all.push(enhancement);
                    return ~this.enabled.indexOf(enhancement.id) && this.load;
                } catch (e) {
                    return Promise.reject(e);
                }
            })
        ).catch(e => console.error("Error loading an enhancement:", e));
    }
    /**
     * Loads the given enhancement.
     * @param enhancement The enhancement to load
     */
    abstract load(enhancement: T): Promise<void>;
    /**
     * Unloads the given enhancement.
     * @param enhancement The enhancement to unload
     */
    abstract unload(enhancement: T): void;
    /**
     * Deletes the given enhancement.
     * @param enhancement Enhancement to delete
     */
    async delete(enhancement: T): Promise<void> {
        // Unload to not bug it out
        this.savedUnload(enhancement)
            .then(() => this.config.delete(enhancement.id))
            .then(
                () =>
                    console.debug(`Deleted enhancement by ID '${enhancement.id}'`),
                e => console.error(`Failed to delete enhancement by ID '${enhancement.id}':\n`, e)
            );
    }

    /**
     * Loads all ReGuilded enhancements onto Guilded.
     */
    loadAll(): void {
        for (let enhancementId of this.enabled) {
            const enhancement = this.all.find(x => x.id === enhancementId);

            if (enhancement) this.load(enhancement);
        }
    }
    /**
     * Loads the given enhancement and then saves the enabled state in the settings.
     * @param enhancement The enhancement to load
     */
    async savedLoad(enhancement: T): Promise<void> {
        this.load(enhancement);
        this.settings.enabled.push(enhancement.id);
        await this.settingsHandler.save();
    }
    /**
     * Removes ReGuilded themes from Guilded.
     */
    unloadAll(): void {
        // Unload all existing enhancements
        for (let enhancement of this.all) {
            if (~this.enabled.indexOf(enhancement.id)) this.unload(enhancement);
        }
    }
    /**
     * Unloads the given enhancement and then saves the disabled state in the settings.
     * @param enhancement The enhancement to unload
     */
    async savedUnload(enhancement: T): Promise<void> {
        this.unload(enhancement);
        this.settings.enabled = this.settings.enabled.filter(extId => extId != enhancement.id);
        await this.settingsHandler.save();
    }

    /**
     * Cleans up the enhancement after it has been deleted.
     * @param metadata The enhancement being deleted
     */
    protected deleteCallback(metadata: T) {
        // To not keep CSS or anything addon injected
        if (~this.enabled.indexOf(metadata.id)) this.unload(metadata);

        this.all.splice(
            this.all.findIndex(other => other.id === metadata.id),
            1
        );

        this.dispatchEvent(new EnhancementEvent("delete", metadata));
    }
    protected abstract watchCallback(metadata: T, loaded: boolean, previousId: string): Promise<void>;
    protected async _watchCallbackBase(metadata: T, currentOrPreviousId: string): Promise<void> {
        this.checkEnhancement(metadata);

        // Update its metadata
        const inAll = this.all.findIndex(other => other.id === currentOrPreviousId);
        if (~inAll) this.all.splice(inAll, 1);

        this.all.push(metadata);
        if (~this.enabled.indexOf(metadata.id)) await this.load(metadata);

        this.dispatchEvent(new EnhancementEvent("change", metadata));
    }

    /**
     * Checks if the identifier of the enhancement is correct or not.
     * @param id The identifier of the enhancement
     * @param path The path of the file
     * @throws {Error} Incorrect parameter `id` syntax
     * @returns Checks identifier's syntax
     */
    protected checkEnhancement(enhancement: T): void {
        const { id, version } = enhancement;

        if (!(typeof id === "string" && id.match(EnhancementHandler.idRegex)))
            throw new Error(`Incorrect syntax of the property 'id'`);
        else if (version && !(typeof version === "string" && this.versionFormatIsFine(enhancement, version))) {
            console.warn(
                `The property 'version' must be a number array with optionally last string or have "rolling" as a value — Enhancement by ID '${enhancement.id}'`
            );
            enhancement.version = enhancement._versionMatches = undefined;
        }
    }
    /**
     * Checks if the format of the version is fine.
     * @param enhancement The enhancement to check version of
     * @param version The version of the enhancement
     * @returns >0 if the format is fine
     */
    private versionFormatIsFine(enhancement: T, version: string): number {
        let versionMatch = version.match(EnhancementHandler.versionRegex);

        return versionMatch && (enhancement._versionMatches = versionMatch.slice(1)).length;
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
export class EnhancementEvent<T extends AnyEnhancement> extends Event {
    public enhancement: T;
    constructor(type: string, enhancement: T) {
        super(type, { cancelable: false });

        this.enhancement = enhancement;
    }
}
