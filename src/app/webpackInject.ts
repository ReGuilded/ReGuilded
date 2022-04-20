import { WebpackBundle, WebpackJsonp, WebpackRequire } from "../app/types/webpack";

/**
 * Returns fake SVG module that exposes Webpack's require and calls original SVG module.
 * @param index Index of this module where it was pushed
 * @param svgModule Webpack SVG module that was replaced
 * @returns Webpack Module
 */
function webpackModule(index: number, svgModule: WebpackBundle): WebpackBundle {
    function fakeFunction(functionId: string, module: { exports: {} }, exports: {}, webpackRequire: WebpackRequire) {
        // Replace itself with old module
        window.webpackJsonp.splice(index, 1);
        window.webpackJsonp._push(svgModule);

        // Calls SVG module to export to this module's exports
        svgModule[1][functionId](module, exports, webpackRequire);

        // Make sure Bundle doesn't fail because of ReGuilded and wait for other modules
        setImmediate(() => {
            console.debug("Initializing ReGuilded");
            window.ReGuilded.init(webpackRequire);
        });
    }

    // Get the SVG module's main method's ID
    const [[svgId], svgFunctions] = svgModule;
    console.debug("SVG Module Id:", svgId, "\nSVG Module Functions:", svgFunctions, "\nSVG Module:", svgModule);

    const fakeFns = {};

    for (let fnId in svgFunctions) fakeFns[fnId] = fakeFunction.bind(this, fnId);

    return [[svgId], fakeFns];
}
/**
 * Pushes a new webpack module and replaces SVG module.
 * @param mod Webpack module to push to webpackJsonp
 */
export default function push(this: WebpackJsonp, mod: WebpackBundle | undefined) {
    // Makes sure that undefined is not pushed
    if (typeof mod == "undefined") return;
    // Pushes fake module instead
    this._push(webpackModule(window.webpackJsonp.length, mod));

    this.push = this._push;
}
