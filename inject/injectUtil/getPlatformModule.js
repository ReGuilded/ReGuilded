const { existsSync } = require('fs')
const path = require('path')

/**
 * Gets utility module with versions based on the current module.
 * @returns Module based on platform
 */
module.exports = () => {
    // Gets path to the module
    const modPath = path.join(__dirname, `../platforms/${process.platform}.js`)
    // Checks if it exists
    if(existsSync(modPath))
        return require(modPath)
    // Else, thrown an error that it is not supported
    else throw new Error("Unsupported platform", process.platform, ". Please submit a new issue");
}