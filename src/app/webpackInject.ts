import { WebpackBundle, WebpackJsonp, WebpackRequire } from "./types/webpack";

/**
 * Returns fake SVG module that exposes Webpack's require and calls original SVG module.
 * @param index Index of this module where it was pushed
 * @param svgModule Webpack SVG module that was replaced
 * @returns Webpack Module
 */
function webpackModule(index: number, svgModule: WebpackBundle): WebpackBundle {
    // Get the SVG module's main method's ID
    const [ [svgId], svgFunctions ] = svgModule;
    const svgMain: string = Object.keys(svgFunctions)[0];
    console.log("SVG Module Id:", svgId, "\nSVG Module Function:", svgMain, "\nSVG Module:", svgModule);

    return [
        [svgId],
        {
            [svgMain]: function (module: { exports: {} }, exports: { }, webpackRequire: WebpackRequire) {
                // Replace itself with old module
                window.webpackJsonp.splice(index, 1);
                window.webpackJsonp._push(svgModule);

                // Calls SVG module to export to this module's exports
                svgModule[1][svgMain](module, exports, webpackRequire);
                console.log("Webpack injection with module:", module);

                // Make sure Bundle doesn't fail because of ReGuilded and wait for other modules
                setImmediate(() => {
                    console.log("Initializing ReGuilded");
                    window.ReGuilded.init(webpackRequire);
                });
            },
        },
    ];
}
/**
 * Pushes a new webpack module and replaces SVG module.
 * @param mod Webpack module to push to webpackJsonp
 */
export default function push(mod: WebpackBundle | undefined) {
    // Makes sure that undefined is not pushed
    if (typeof mod === "undefined") return;
    // Pushes fake module instead
    this._push(webpackModule(window.webpackJsonp.length, mod));

    this.push = this._push;
}
