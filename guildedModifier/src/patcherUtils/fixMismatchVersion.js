const { readFileSync, writeFileSync } = require("fs")
const { spawnSync } = require("child_process")
const { join } = require("path")

module.exports = (guildedPackage, reguildedPackage) => {
    const reguildedPackageSource = readFileSync(reguildedPackage);
    var reguildedPackageJSON = JSON.parse(reguildedPackageSource);

    if (reguildedPackageJSON.version !== guildedPackage.version) {
        //throw new Error(`Version mismatch between ReGuilded and Guilded. ReGuilded: ${reguildedPackageJSON.version} vs Guilded: ${guildedPackage.version}. Linux version of ReGuilded requires manual editing.`)
        reguildedPackageJSON.version = guildedPackage.version;

        // Turns made package file into JSON
        const packageJson = JSON.stringify(reguildedPackageJSON);
        // If this is on Linux, create file and move it to Guilded
        if (process.platform === 'linux' && process.getuid() !== 0) {
            // Creates file's path
            const filePath = join(__dirname, '_package.json')
            // Creates a temporary file
            writeFileSync(filePath, packageJson)
            // Replaces ReGuilded's package JSON with the temporary file
            spawnSync('sudo', ['mv', filePath, reguildedPackage], { stdio: 'inherit' })
        }
        // Else, don't ask for sudo permissions
        else
            writeFileSync(reguildedPackage, packageJson);

        // TODO: Find a way to automatically rerun the process correctly after changing the version.
        console.warn("There was a mismatch version between ReGuilded and Guilded. If you're seeing this, we've successfully fixed this, and all you need to do is relaunch Guilded.");
        process.exit(0)
    }
}