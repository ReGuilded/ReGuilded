const { readFileSync, writeFileSync } = require("fs")

module.exports = (guildedPackage, reguildedPackage) => {
    const reguildedPackageSource = readFileSync(reguildedPackage);
    var reguildedPackageJSON = JSON.parse(reguildedPackageSource);

    if (reguildedPackageJSON.version != guildedPackage.version) {
        reguildedPackageJSON.version = guildedPackage.version;

        writeFileSync(reguildedPackage, JSON.stringify(reguildedPackageJSON, null, 2));

        // TODO: Find a way to automatically rerun the process correctly after changing the version.
        throw new Error("There was a mismatch version between ReGuilded and Guilded. If you're seeing this, we've successfully fixed this, and all you need to do is relaunch Guilded.");
    }
}