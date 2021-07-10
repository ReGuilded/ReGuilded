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
        this._webpackModules = webpackRequire.m
        this._asModule = webpackRequire(0)
    }
    /**
     * Gets Webpack module with specific ID attached
     * @param {Number} id Gets module by the identifier
     * @returns Webpack Module
     */
    withId(id) {
        return this._asModule(this._webpackRequire(id))
    }
}