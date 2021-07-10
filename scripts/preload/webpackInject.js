// ID of the SVG module
const svgId = 151;

/**
 * Returns fake SVG module that exposes Webpack's require and calls original SVG module.
 * @param {Number} index Index of this module where it was pushed
 * @param {WebpackModule} svgModule Webpack SVG module that was replaced
 * @returns Webpack Module
 */
function webpackModule(index, svgModule) {
    // Get the SVG module's main method's ID
    const svgMain = Object.keys(svgModule[1])[0];
    // Returns the new module
    return [
        [svgId],
        {
            [svgMain]: function (module, exports, webpackRequire) {
                // Makes webpackRequire globally available
                global.webpackRequire = webpackRequire;
                // Immediately remove itself
                global.webpackJsonp.splice(index, 1);
                // Replace itself with old SVG module
                global.webpackJsonp._push(svgModule);
                // Calls SVG module to export to this module's exports
                svgModule[1][svgMain](module, exports, webpackRequire);
                // Initiates ReGuilded with webpackRequire
                global.ReGuilded.init(webpackRequire);
            },
        },
    ];
}
/**
 * Pushes a new webpack module and replaces SVG module.
 * @param {WebpackModule} mod Webpack module to push to webpackJsonp
 */
function push(mod) {
    // Makes sure that undefined is not pushed
    if (typeof mod === "undefined") return;
    // Gets ID of the module
    const [[id]] = mod;
    // Checks if its ID is 151, SVG module's id
    if (id === svgId) {
        // Sets SVG module locally
        svgModule = mod;
        // Pushes ReGuilded's module instead
        global.webpackJsonp._push(webpackModule(window.webpackJsonp.length, mod));
        // Otherwise, push module normally
    } else global.webpackJsonp._push(mod);
}
module.exports = push;
