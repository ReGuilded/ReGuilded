import { WebpackBundle, WebpackRequire, WebpackModule, WebpackExports } from "../types/webpack";

/**
 * The manager that deals with Webpack-related things, especially modules.
 */
export default class WebpackManager {
    _webpackRequire: WebpackRequire;
    _webpackExports: {
        [moduleId: number]: WebpackExports;
    };
    _webpackModules: WebpackModule[];
    _chunkBreadcrumb: RegExp;
    asEsModule: (module: { default: any } | any) => { default: any };
    _webpackExportList: WebpackExports[];
    /**
     * The manager that deals with Webpack-related things, especially modules.
     * @param webpackRequire Function that gives the exports of a given module.
     */
    constructor(webpackRequire: WebpackRequire) {
        this._webpackRequire = webpackRequire;
        this._webpackExports = webpackRequire.c;
        this._webpackModules = webpackRequire.m;
        this._chunkBreadcrumb = webpackRequire.p;
        this.asEsModule = webpackRequire(0);

        this._webpackExportList = Object.values(this._webpackExports);
        // Patch WebpackJsonp's push to update export list
        window.webpackJsonp.push = (mod: WebpackBundle) => {
            let n = window.webpackJsonp._push(mod);

            // Wait for its exports to be a thing(that could still lead to undefined exports)
            setImmediate(() => {
                for (let func of Object.keys(mod[1])) {
                    const exports = this._webpackExports[func];

                    if (exports) this._webpackExportList.push(exports);
                }
            });

            return n;
        };
    }
    /**
     * Returns the specific module with the given identifier.
     * @param id Gets module by the identifier
     * @returns Webpack Module Exports
     */
    withId(id: number): any | void {
        return this.asEsModule(this._webpackRequire(id));
    }
    /**
     * Matches and returns the set of modules that were filtered out with the given function.
     * @param fn Function to filter modules.
     * @returns Webpack Module Exports
     */
    allWithFilter(fn: (mod: WebpackExports) => boolean): (any | void)[] {
        return this._webpackExportList.filter(fn).map(x => x.exports);
    }
    /**
     * Matches and returns the module that was found using filter.
     * @param fn Function to filter out modules.
     * @returns Webpack Module Exports
     */
    withFilter(fn: (mod: WebpackExports) => boolean): any | void {
        return this._webpackExportList.find(fn)?.exports;
    }
    /**
     * Matches and returns the module with the function that contains the given part of code.
     * @param code The part of code that function should contain.
     * @returns Found function
     */
    withCode(code: string): Function | { default: Function } | void {
        return this.withFilter(x => {
            const { default: fn } = this.asEsModule(x.exports);

            // Checks if it is a function and has part of the code
            return typeof fn == "function" && fn.toString().includes(code);
        });
    }
    /**
     * Matches and returns the module with the component that contains the given part of code.
     * @param code The part of code that component should contain.
     * @returns Found component
     */
    withComponentCode(code: string): Function | { default: Function } | void {
        return this.withFilter(x => {
            const { default: fn } = this.asEsModule(x.exports);

            // Checks if it is a function and has part of the code
            return (
                typeof fn === "function" &&
                fn.prototype &&
                "render" in fn.prototype &&
                fn.prototype.render.toString().includes(code)
            );
        });
    }
    /**
     * Matches and returns the module that contains a property with the given name.
     * @param name The name of the property
     * @returns Webpack Module Exports
     */
    allWithProperty(name: string): (object | Function | typeof Object | { default: object | Function | typeof Object })[] {
        return this.allWithFilter(x => {
            const { default: obj, ...rest } = this.asEsModule(x.exports);

            // Returns whether it contains that property
            return obj && (obj[name] || rest[name]);
        });
    }
    /**
     * Matches and returns the module that contains a property with the given name.
     * @param name The name of the property
     * @returns Webpack Module Exports
     */
    withProperty(name: string): object | Function | typeof Object | { default: object | Function | typeof Object } | void {
        return this.withFilter(x => {
            const { default: obj, ...rest } = this.asEsModule(x.exports);

            // Returns whether it contains that property
            return (obj && obj[name]) || rest[name];
        });
    }
    /**
     * Matches and returns module with property found in the given path.
     * @param path The path of the property
     * @returns Webpack Module Exports
     */
    withDeepProperty(...path: (string | number)[]): object | Function | void {
        return this.withFilter(x => {
            // Current object to look at
            let current = x.exports;

            if (!current) return false;

            for (let name of path) {
                if (!current[name]) return false;

                // Go deeper
                current = current[name];
            }
            // Property in the path exists
            return true;
        });
    }
    /**
     * Matches and returns the module containing a class with the given prototype property.
     * @param name The name of the property that prototype should contain
     * @returns Webpack Module Exports
     */
    withClassProperty(name: string): typeof Object | { default: typeof Object } {
        return this.withFilter(x => {
            const { default: type } = this.asEsModule(x?.exports);

            return (
                typeof type == "function" &&
                // Functions vs classes check
                type.prototype != null &&
                name in type.prototype
            );
        });
    }
    /**
     * Matches and returns the module containing a class with all of the given prototype properties.
     * @param names The names of the properties that the prototype should include
     * @returns Webpack Module Exports
     */
    withClassProperties(names: string[]): typeof Object | { default: typeof Object } {
        return this.withFilter(x => {
            const { default: type } = this.asEsModule(x?.exports);

            if (typeof type != "function" || typeof type.prototype == "undefined") return false;

            // It does not need to check other properties, because it will always be false
            for (let name of names) if (!(name in type.prototype)) return false;

            return true;
        });
    }
    /**
     * Gets a module from WebpackJsonp.
     * @param id The identifier of the pushed module
     * @returns WebpackJsonp module
     */
    getPushedModule(id: number) {
        return window.webpackJsonp.find(x => x[0][0] == id);
    }
    /**
     * Pushes a new module to webpackJsonp
     * @param mod Webpack module to push
     * @returns Push return
     */
    pushModule(mod: WebpackBundle) {
        return window.webpackJsonp.push(mod);
    }
}
