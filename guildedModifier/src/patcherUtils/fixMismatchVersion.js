const { readFileSync, writeFileSync } = require("fs")

module.exports = (guildedPackage, reguildedPackage) => {
    const reguildedPackageSource = readFileSync(reguildedPackage);
    var reguildedPackageJSON = JSON.parse(reguildedPackageSource);

    if (reguildedPackageJSON.version !== guildedPackage.version) {
        // If this is on Linux, throw an error
        if (process.platform === 'linux' && process.getuid() !== 0)
            throw new Error(`Version mismatch between ReGuilded and Guilded. ReGuilded: ${reguildedPackageJSON.version} vs Guilded: ${guildedPackage.version}. Linux version of ReGuilded requires manual editing.`)
        reguildedPackageJSON.version = guildedPackage.version;

        writeFileSync(reguildedPackage, JSON.stringify(reguildedPackageJSON, null, 2));

        // TODO: Find a way to automatically rerun the process correctly after changing the version.
        throw new Error("There was a mismatch version between ReGuilded and Guilded. If you're seeing this, we've successfully fixed this, and all you need to do is relaunch Guilded.");
    }
}