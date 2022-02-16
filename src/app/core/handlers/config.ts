import { ReGuildedConfigCommon } from "../../../common/reguilded-settings";
//import { AbstractEventTarget } from "./eventTarget";

/**
 * The wrapping handler around `window.ReGuildedConfig.settings` for easier changes tracking.
 */
export default class ConfigHandler<T> {
    exposed: ReGuildedConfigCommon<T>;
    config: T;

    constructor(toUse: ReGuildedConfigCommon<T>) {
        this.exposed = toUse;
        this.config = toUse.getConfig();
    }
    /**
     * Updates the settings and saves them in settings file.
     * @param settingsProps The properties to set
     */
    async update(settingsProps: Partial<T>): Promise<void> {
        this.config = Object.assign(this.config, settingsProps);
        await this.exposed.updateConfig(settingsProps);
    }
    /**
     * Saves the current settings.
     */
    async save(): Promise<void> {
        await this.exposed.updateConfig(this.config);
    }
}
