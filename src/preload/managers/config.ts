import { promises as fsPromises } from "fs";
const { writeFile } = fsPromises;
import { join } from "path";
import { ReGuildedConfigCommon } from "../../common/reguilded-settings";
import { BaseManager } from "./base";

/**
 * A manager that manages ReGuilded's configuration.
 */
export default class ConfigManager<T extends {}> implements BaseManager<ReGuildedConfigCommon<T>> {
    directory: string;
    config: T;
    filename: string;
    exportable: ReGuildedConfigCommon<T>;

    constructor(directory: string, filename: string, config: T) {
        this.directory = directory;
        this.filename = filename;

        this.config = config;

        this.exportable = {
            getConfig: () => this.config,
            updateConfig: async (props: Partial<T>) => void (await this.updateConfig(props))
        };
    }

    /**
     * Saves current configuration of the state.
     */
    async save(): Promise<void> {
        await writeFile(this.file, JSON.stringify(this.config), {
            encoding: "utf8"
        });
    }

    /**
     * Updates the configuration and saves it to settings file.
     * @param newConfig The configuration properties to update with their updated values
     * @returns Configuration
     */
    updateConfig(newConfig: Partial<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            Object.assign(this.config, newConfig);
            // To save it to JSON and hand out the given properties
            this.save().then(
                () => resolve(this.config),
                e => reject(e)
            );
        });
    }

    /**
     * Gets the path to the main file.
     * @returns Full file path
     */
    get file(): string {
        return join(this.directory, this.filename);
    }

    /**
     * Gets configuration property if it exists.
     * @param prop Property's name
     * @returns Property's value
     */
    getValue<P extends keyof T>(prop: P): T[P] {
        return this.config[prop];
    }
}
