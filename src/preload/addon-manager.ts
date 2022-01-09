import { promises as fsPromises, statSync, readFileSync } from "fs";
import { join, resolve as pathResolve, extname } from "path";
import ExtensionManager from "./extension-manager";
import { Addon } from "../common/extensions";
import { webFrame } from "electron";

type ExecutableModule<T> = (__filename: string, __dirname: string, require: (file: string) => any) => T;
type AddonExports = {
    load: Function;
    unload?: Function;
    init?: Function;
};

export default class AddonManager extends ExtensionManager<Addon> {
    constructor(dirname: string) {
        super("add-on", dirname);
    }
    protected override onFileChange(addon: Addon) {
        // TODO: Unload & load add-on
        return new Promise<void>(async resolve => {
            // Because we can't have multiple entry points
            if (Array.isArray(addon.files)) {
                console.warn(
                    "Expected add-on by ID '",
                    addon.id,
                    "' to have string 'files' in files property. Using first array item."
                );
                addon.files = addon.files[0];
            }

            addon.execute = async () =>
                await AddonManager._executeFile<AddonExports>(pathResolve(addon.dirname, addon.files)).then(exported => {
                    // Make sure it's appropriate
                    if (typeof exported !== "object" || typeof exported.load !== "function") {
                        throw new Error(
                            "Add-on's main file's exports must be an object containing at least load function and optionally init and unload."
                        );
                    } else return exported;
                });
            resolve();
        });
    }
    /**
     * Requires module's files.
     * @param dirname The directory of the module
     * @param path The path module requires
     * @returns File's exports
     */
    private static async _require(dirname: string, path: string): Promise<any> {
        // No idea how to do require properly while it being synchronous.
        // For recursive purposes
        return await AddonManager._requireWholePath(pathResolve(dirname, path));
    }
    /**
     * Requires the file in the given absolute path.
     * @param path The absolute path to require
     * @returns File's exports
     */
    private static async _requireWholePath(path: string): Promise<any> {
        try {
            const stats = statSync(path);

            // Require dir/index.js like require does
            return stats.isDirectory()
                ? await this._requireWholePath(join(path, "index.js"))
                : await this._executeFile(path);
        } catch (_) {
            const ext = extname(path);
            const jsPath = ext ? path : path + ".js";

            return ext.toLowerCase() === ".json"
                ? JSON.parse(await fsPromises.readFile(path, { encoding: "utf8" }))
                : await this._executeFile(jsPath);
        }
    }
    /**
     * Executes the file in the Electron's context and returns its exports.
     * @param filename The file to execute
     * @returns File's exports
     */
    private static async _executeFile<T>(filename: string): Promise<T> {
        const dirname = join(filename, ".."),
            require = this._require.bind(this, dirname);

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
