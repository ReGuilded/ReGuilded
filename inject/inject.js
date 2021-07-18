const { argv } = require("yargs");
const { getPlatformModule } = require("./injectUtil");
const platformModule = getPlatformModule();
const dir = argv.d || argv.dir

if(dir) require("./injection")(platformModule.getAppDir(), argv.d || argv.dir);
else throw new Error("Expected -d or --dir flag with ReGuilded's directory")