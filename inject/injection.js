const { writeFileSync, mkdirSync } = require("fs");
const { join, sep } = require("path");

module.exports = function(guildedDir, reguildedDir) {
    // Creates the "app" directory in Guilded's "resources" directory.
    mkdirSync(guildedDir);

    // Creates a path for patcher for require statement
    const patcherPath = join(reguildedDir, "scripts/reguildedPatcher.js").replace(RegExp(sep.repeat(2), "g"), "/");

    // Creates require statement in `index.js`
    writeFileSync(join(guildedDir, "index.js"), `require("${patcherPath}");`);
    writeFileSync(join(guildedDir, "package.json"), JSON.stringify({ name: "Guilded", main: "index.js" }));
}