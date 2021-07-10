/**
 * The manager that deals with Webpack-related things, especially modules.
 */
module.exports = class WebpackManager {
    /**
     * The manager that deals with Webpack-related things, especially modules.
     * @param {Function} webpackRequire Function that gives the exports of a given module.
     */
    constructor(webpackRequire) {
        this._webpackRequire = webpackRequire
        this._webpackExports = webpackRequire.c
        this._webpackExportList = Object.values(this._webpackExports)
        this._webpackModules = webpackRequire.m
        this._asModule = webpackRequire(0)

        this.modules = {}
    }
    /**
     * Fetches various modules, classes and other things from Guilded's webpack.
     */
    fetch() {
        return {
            messages: this.withClassProperty('chatMessageInfo')[0],
            channels: this.withProperty('ChannelModel')[0]
        }
    }
    /**
     * Gets Webpack module's exports with specific ID attached
     * @param {Number} id Gets module by the identifier
     * @returns Webpack Module Exports
     */
    withId(id) {
        return this._asModule(this._webpackRequire(id))
    }
    /**
     * Gets Webpack module's exports using specific filter
     * @param {(mod: {exports: {default: any}}) => Boolean} fn Function to filter modules with.
     * @returns Webpack Module Exports
     */
    withFilter(fn) {
        return this._webpackExportList.filter(fn)
    }
    /**
     * Gets exports of a Webpack module that has specific property.
     * @param {String} name The name of the property that the module should contain.
     * @returns Webpack Module Exports
     */
    withProperty(name) {
        return this.withFilter(x => x.exports && x.exports[name])
    }
    /**
     * Gets exports of a Webpack module that contains class with the given property.
     * @param {String} name The name of the property that prototype should contain.
     * @returns Webpack Module Exports
     */
    withClassProperty(name) {
        return this.withFilter(x =>
            // Checks if x.exports.prototype has property
            (typeof x.exports === 'function' && x.exports.prototype && x.exports.prototype?.hasOwnProperty?.(name)) ||
            // Checks if x.exports.default.prototype has property
            (typeof x.exports?.default === 'function' && x.exports.default.prototype && x.exports.default.prototype?.hasOwnProperty?.(name))
        )
    }
    /**
     * Gets a module from WebpackJsonp.
     * @param {number} id The identifier of the pushed module
     * @returns WebpackJsonp module
     */
    getPushedModule(id) {
        return global.webpackJsonp.find(x => x[0][0] === id)
    }
    /**
     * Pushes a new module to webpackJsonp
     * @param {[[Number], [Function], [], [String]]} mod Webpack module to push
     * @returns Push return
     */
    pushModule(mod) {
        return global.webpackJsonp.push(mod)
    }
    /**
     * Removes pushed modules from WebpackJsonp with the given ID.
     * @param {number} id The identifier of the pushed module
     * @returns WebpackJsonp
     */
    removeModules(id) {
        // Filtered webpackJsonp without the module
        const filtered = global.webpackJsonp.filter(x => x[0][0] !== id)
        // Sets new webpackJsonp
        global.webpackJsonp = filtered
        // Returns webpackJsonp
        return filtered
    }
}