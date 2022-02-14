type InitFunction = (
    exporter: Function,
    utils: {}
) => {
    setters: Array<(dependencyExports: any) => void>;
    execute: () => void;
};

/**
 * Creates a System.js replica for the module.
 * @param importable Dynamically importable modules
 * @param imported Already imported modules
 * @param exports The exports of this module
 * @returns `System` object for the module
 */
export default function createSystem(
    importable: { [prop: string]: () => Promise<any> },
    imported: { [prop: string]: any },
    exports: { [prop: string]: any }
) {
    /**
     * Stuff that get passed into registered module function.
     */
    const systemUtils = {
        import(name: string) {
            return importable[name]();
        }
    };
    /**
     * Exports properties.
     * @param name The name of the export or the object containing exports
     * @param value The value of the export
     */
    function exporter(name: string, value: any) {
        if (typeof name === "string") exports[name] = value;
        else Object.assign(exports, name);

        return value || name;
    }
    return {
        register(_: string, dependencies: string[], initFn: InitFunction) {
            const mod = initFn(exporter, systemUtils);

            if (mod.setters !== undefined) for (let i in dependencies) mod.setters[i](imported[dependencies[i]]);

            mod.execute();
        }
    };
}
