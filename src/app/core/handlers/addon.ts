import { ReGuildedExtensionSettings } from "../../../common/reguilded-settings";
import initializeApi from "../../addons/initializeApi";
import { RGAddonConfig } from "../../types/reguilded";
import { Addon } from "../../../common/extensions";
import WebpackManager from "../../addons/webpack";
import AddonApi from "../../addons/addonApi";
import ExtensionHandler from "./extension";
import SettingsHandler from "./settings";

/**
 * Manager that manages ReGuilded's addons
 */
export default class AddonHandler extends ExtensionHandler<Addon, RGAddonConfig> {
    initialized: string[] = [];
    webpack?: WebpackManager;
    /**
     * Manager that manages ReGuilded's addons
     * @param addonsDir Path to the directory that holds addons
     * @param settings The settings of the add-ons
     * @param settingsHandler The extension settings handler
     * @param config The preload configuration for add-ons
     */
    constructor(settings: ReGuildedExtensionSettings, settingsHandler: SettingsHandler, config: RGAddonConfig) {
        super(settings, settingsHandler, config);
    }

    /**
     * Initiates addons for ReGuilded and addon manager
     * @param addonApi ReGuilded Addon API.
     */
    init(addonApi: AddonApi) {
        console.log("Initiating addon manager");
        // Initialize these here instead of getDirs()
        this.all = [];
        // Try-catch; this should never throw errors
        try {
            // Initialize these
            initializeApi(addonApi);
        } catch (e) {
            console.error("Failed to initialize the ReGuilded addon API!", e);
        }
        this.config.setWatchCallback(this._watchCallback.bind(this));
    }
    private _watchCallback(metadata: Addon, loaded: boolean) {
        const isEnabled = ~this.enabled.indexOf(metadata.id);
        // If the addon is already loaded, unload it
        AddonHandler._functionExists(metadata, "unload") && loaded && this.unload(metadata);
        // If the addon is in the list of all loaded addons, remove it
        if (~this.all.indexOf(metadata)) this.all.splice(this.all.indexOf(metadata), 1);

        this.all.push(metadata);
        // Load the addon if enabled.
        isEnabled && this.load(metadata);
    }
    private static _functionExists(addon: Addon, name: string): boolean {
        if (typeof addon.exports[name] === "function") return true;
        // It doesn't exist, but it's also valid
        else if (typeof addon.exports[name] === "undefined") return false;
        // It's invalid
        else {
            console.warn("Add-on by ID '", addon.id, "' has invalid export '", name, "': must be a function or undefined.");
            addon.exports[name] = undefined;

            return false;
        }
    }

    /**
     * Loads a ReGuilded addon.
     * @param metadata addon to load onto Guilded
     */
    load(metadata: Addon): void {
        // Try-catch errors to prevent conflicts with other plugins
        try {
            console.log(`Loading addon by ID`, metadata.id);
            // Check if it's first time loading
            if (!~this.initialized.indexOf(metadata.id) && AddonHandler._functionExists(metadata, "init")) {
                metadata.exports.init();
                this.initialized.push(metadata.id);
            }

            metadata.exports.load();
        } catch (e) {
            console.error("Failed to load addon by ID", metadata.id, e);
        }
    }

    /**
     * Unloads/removes a ReGuilded addon.
     * @param metadata addon to load onto Guilded
     */
    unload(metadata: Addon) {
        // TODO: Add-on support
        try {
            console.log("Unloading addon by ID", metadata.id);
            metadata.exports.unload(this, this.webpack);
        } catch (e) {
            console.error("Failed to unload an addon by ID", metadata.id, e);
        }
    }
}
