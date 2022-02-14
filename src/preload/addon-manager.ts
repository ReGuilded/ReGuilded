import { promises as fsPromises, statSync, readFileSync } from "fs";
import { join, resolve as pathResolve, extname } from "path";
import EnhancementManager from "./enhancement-manager";
import { Addon } from "../common/enhancements";
import { webFrame } from "electron";

type ExecutableModule<T> = (__filename: string, __dirname: string, require: (file: string) => any) => T;
type AddonExports = {
    load: Function;
    unload?: Function;
    init?: Function;
};

export default class AddonManager extends EnhancementManager<Addon> {
    addonsToIsolatedWorlds: {
        [addonId: string]: number;
    };
    currentIsolatedWorld = 1000;
    constructor(dirname: string) {
        super("addon", dirname);

        this.addonsToIsolatedWorlds = {};
    }
    protected override onFileChange(addon: Addon) {
        // TODO: Unload & load addon
        return new Promise<void>(async resolve => {
            // Because we can't have multiple entry points
            if (Array.isArray(addon.files)) {
                console.warn(
                    "Expected addon by ID '%s' to have property 'files' as a string, not array. Using first array item.",
                    addon.id
                );
                addon.files = addon.files[0];
            }

            if (typeof addon.requiredPermissions !== "number") {
                console.error("Expected addon by ID '%s' to have property 'requiredFiles' as a number.");
                addon.requiredPermissions = 0;
            }
            // Keep the same isolated world. If addon needs consistent window variables, then it can be kept.
            // const addonsWorld = (this.addonsToIsolatedWorlds[addon.id] = this.addonsToIsolatedWorlds[addon.id]
            //     ? this.addonsToIsolatedWorlds[addon.id]
            //     : this.currentIsolatedWorld++);

            addon.execute = async (importable: (path: string) => [boolean, any?]) =>
                await AddonManager._executeFile<AddonExports>(
                    0, // TODO: Use actual worlds with better Addon API
                    pathResolve(addon.dirname, addon.files),
                    importable
                ).then(exported => {
                    // Make sure it's appropriate
                    if (typeof exported !== "object" || typeof exported.load !== "function") {
                        throw new Error(
                            "Addon's main file's exports must be an object containing at least load function and optionally init and unload."
                        );
                    } else return exported;
                });
            resolve();
        });
    }
    /**
     * Requires module's files.
     * @param worldId The identifier of the addon's world
     * @param dirname The directory of the module
     * @param path The path module requires
     * @returns File's exports
     */
    private static async _require(
        worldId: number,
        dirname: string,
        importable: (path: string) => [boolean, any?],
        path: string
    ): Promise<any> {
        const [importableExists, importableContents] = importable(path);
        // No idea how to do require properly while it being synchronous.
        // For recursive purposes
        return importableExists
            ? importableContents
            : await AddonManager._requireWholePath(worldId, pathResolve(dirname, path), importable);
    }
    /**
     * Requires the file in the given absolute path.
     * @param worldId The identifier of the addon's world
     * @param path The absolute path to require
     * @returns File's exports
     */
    private static async _requireWholePath(
        worldId: number,
        path: string,
        importable: (path: string) => [boolean, any?]
    ): Promise<any> {
        const ext = extname(path).toLowerCase();

        try {
            const stats = statSync(path);

            // Require dir/index.js like require does
            return stats.isDirectory()
                ? await this._requireWholePath(worldId, join(path, "index.js"), importable)
                : ext === ".json"
                ? JSON.parse(await fsPromises.readFile(path, { encoding: "utf8" }))
                : await this._executeFile(worldId, path, importable);
        } catch (_) {
            if (!ext) {
                const jsPath = path + ".js";

                return await this._executeFile(worldId, jsPath, importable);
            }
        }
    }
    /**
     * Executes the file in the Electron's context and returns its exports.
     * @param worldId The identifier of the addon's world
     * @param filename The file to execute
     * @returns File's exports
     */
    private static async _executeFile<T>(
        worldId: number,
        filename: string,
        importable: (path: string) => [boolean, any?]
    ): Promise<T> {
        const dirname = join(filename, ".."),
            require = this._require.bind(this, worldId, dirname, importable);

        return await fsPromises
            .readFile(filename, "utf8")
            .then(
                async fileData =>
                    /*   // It is more convenient passing `require` this way rather than executing it immediately
                     *   ((__filename, __dirname, require) => {
                     *       const module = { exports: {}, filename: __filename };
                     *       const { exports } = module;
                     *       // We don't want it tinkering with the return
                     *       (() => { ${fileData} })();
                     *       // Since executeJavaScript doesn't pass any module/exports updates to this context
                     *       return exports;
                     *   })
                     */
                    await webFrame.executeJavaScript(
                        `(async (__filename,__dirname,require)=>{const module={exports:{},filename:__filename};const{exports}=module;return await (async ()=>{${fileData}})().then(() => module.exports);})`
                    )
            )
            .then((m: ExecutableModule<T>) => m(filename, dirname, require));
    }
}
