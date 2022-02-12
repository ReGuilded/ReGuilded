import { ReGuildedAddonSettings } from "../../../common/reguilded-settings";
import { RGAddonConfig } from "../../types/reguilded";
import { Addon } from "../../../common/extensions";
import WebpackManager from "../../addons/webpack";
import AddonApi from "../../addons/addonApi";
import ExtensionHandler from "./extension";
import SettingsHandler from "./settings";
import ReGuilded from "../ReGuilded";

/**
 * Manager that manages ReGuilded's addons
 */
export default class AddonHandler extends ExtensionHandler<Addon, RGAddonConfig, ReGuildedAddonSettings> {
    initialized: string[] = [];
    webpack?: WebpackManager;
    addonApis: { [addonId: string]: AddonApi };

    /**
     * Manager that manages ReGuilded's addons
     * @param parent The parent ReGuilded instance
     * @param addonsDir Path to the directory that holds addons
     * @param settings The settings of the addons
     * @param settingsHandler The extension settings handler
     * @param config The preload configuration for addons
     */
    constructor(
        parent: ReGuilded,
        settings: ReGuildedAddonSettings,
        settingsHandler: SettingsHandler,
        config: RGAddonConfig
    ) {
        super(parent, settings, settingsHandler, config);

        this.addonApis = {};
    }

    /**
     * Initiates addons for ReGuilded and addon manager
     */
    async init(): Promise<void> {
        this.settingsHandler.settings.debugMode && console.log("Initiating addon manager");

        await super.init();
    }
    protected override async watchCallback(metadata: Addon, loaded: boolean, previousId: string): Promise<void> {
        const currentOrPreviousId = previousId || metadata.id;
        // If the addon is already loaded, unload it
        if (loaded) {
            if (~this.enabled.indexOf(currentOrPreviousId)) {
                // FIXME: We already kind of do that in ExtensionHandler, but with index
                const previousMetadata = this.all.find(addon => addon.id === currentOrPreviousId);
                this.unload(previousMetadata);
            }

            // Since it will try invoking .load with metadata change if previous ID is same as the current ID
            const initIndex = this.initialized.indexOf(currentOrPreviousId);
            if (~initIndex) this.initialized.splice(initIndex, 1);
        }

        await super._watchCallbackBase(metadata, currentOrPreviousId);
    }
    /**
     * Returns whether the exported function exists. If the export isn't a function or undefined, it returns a warning.
     * @param addon The addon to check export function of
     * @param name The exported function to check
     * @returns Function exists
     */
    private static _functionExists(addon: Addon, name: string): boolean {
        if (typeof addon.exports === "undefined") return false;
        else if (typeof addon.exports[name] === "function") return true;
        // It doesn't exist, but it's also valid
        else if (typeof addon.exports[name] === "undefined") {
            const { default: def } = addon.exports;
            const defType = typeof def;

            if ((defType === "function" || defType === "object") && typeof def[name] === "function") {
                addon.exports[name] = def[name];
                return true;
            } else return false;
        } else {
            // It's invalid
            console.warn("Addon by ID '%s' has invalid export '%s': must be a function or undefined.", addon.id, name);
            addon.exports[name] = undefined;

            return false;
        }
    }

    /**
     * Loads a ReGuilded addon.
     * @param metadata addon to load onto Guilded
     */
    async load(metadata: Addon): Promise<void> {
        // Try-catch errors to prevent conflicts with other plugins
        try {
            this.settingsHandler.settings.debugMode && console.log(`Loading addon by ID '${metadata.id}'`);
            // Check if it's first time loading
            console.log("Load initialized", JSON.stringify(metadata.id));
            if (!~this.initialized.indexOf(metadata.id)) {
                this.addonApis[metadata.id] = new AddonApi(this.webpack, this, metadata.id);

                await metadata
                    // Allow requiring stuff from its very own API
                    .execute((path: string) => [path in this.addonApis[metadata.id], this.addonApis[metadata.id][path]])
                    .then(exports => {
                        metadata.exports = exports;
                        // One-time `init` function
                        AddonHandler._functionExists(metadata, "init") && metadata.exports.init();

                        console.log("Loading first time");
                        this.initialized.push(metadata.id);
                        metadata.exports.load();
                    })
                    .catch(e => console.error(`Error while getting exports of addon by ID '${metadata.id}':`, e));
            } else metadata.exports.load();
        } catch (e) {
            console.error(`Failed to load addon by ID '${metadata.id}':\n`, e);
        }
    }

    /**
     * Unloads/removes a ReGuilded addon.
     * @param metadata addon to load onto Guilded
     */
    unload(metadata: Addon) {
        try {
            this.settingsHandler.settings.debugMode && console.log(`Unloading addon by ID '${metadata.id}''`);
            AddonHandler._functionExists(metadata, "unload") && metadata.exports.unload(this, this.webpack);
        } catch (e) {
            console.error(`Failed to unload an addon by ID '${metadata.id}':\n`, e);
        }
    }
    /**
     * Gets the specified addon's permissions.
     * @param addonId The identifier of the addon to get permissions of
     * @returns Permissions
     */
    getPermissionsOf(addonId: string) {
        return this.settings.permissions[addonId];
    }
    /**
     * Returns the specified permission if addon has it.
     * @param addonId The identifier of the addon to get permissions of
     * @param permission The permissions to check
     * @returns Permissions that it has
     */
    hasAnyPermission(addonId: string, permission: AddonPermission) {
        return this.getPermissionsOf(addonId) & permission;
    }
    /**
     * Returns whether the addon has all specified permissions.
     * @param addonId The identifier of the addon
     * @param permissions All of the permissions it requires
     * @returns Has all permissions
     */
    hasAllPermissions(addonId: string, permissions: AddonPermission) {
        return (this.getPermissionsOf(addonId) & permissions) === permissions;
    }
    /**
     * Sets the specified permissions to an addon.
     * @param addonId The identifier of the addon to set permissions of
     * @param permissions The permission to set for the addon
     */
    async setPermissions(addonId: string, permissions: AddonPermission) {
        this.settings.permissions[addonId] = permissions;
        await this.settingsHandler.updateSettings({ addons: this.settings });
    }
}
export enum AddonPermission {
    Elements = 1,
    ExtraInfo = 2,
    UseApi = 4,
    UseExternalApi = 8
}
