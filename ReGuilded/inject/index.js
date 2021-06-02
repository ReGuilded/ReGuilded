const { exec } = require("child_process");
const inject = require("./inject.js");

// TODO: Figure out what directory Guilded is in on derwin and what the command is to force close it.
let platformModule;
try {
    platformModule = require(`./platforms/${process.platform}.js`);
} catch (err) {
    if (err.code === "MODULE_NOT_FOUND") {
        console.log(`[ReGuilded] | Your platform, ${process.platform}, does not seem to be supported yet.\n[ReGuilded] | Go ahead and create a new Issue on GitHub, make sure to include that you're attempting to use it on "${process.platform}"!\n[ReGuilded] | https://github.com/ReGuilded/ReGuilded/issues/new`);
        return;
    }
}

injectAsync()
async function injectAsync() {
    const taskArg = process.argv[2];

    if (["inject", "uninject"].includes(taskArg)) {        
        console.log(`[ReGuilded] | Now performing the ${taskArg} task.\n[ReGuilded] | Force closing Guilded.`)
        exec(`${await platformModule.closeGuilded()}`);

        try {
            await inject[taskArg](await platformModule.getAppDir());

            console.log(`[ReGuilded] | The ${taskArg} task has been performed successfully!`);
        } catch(err) {
            console.log(`[ReGuilded] | There was an error trying to ${taskArg}.\n[ReGuilded] | ${err}`);
        }
    } else {
        console.log("[ReGuilded] | Unsupported Argument.");
    }
};