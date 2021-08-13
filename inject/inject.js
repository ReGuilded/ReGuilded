import yargs from "yargs";
import platform from "./platform.js";
import injection from "./injection.js";

const { argv } = yargs

// Gets passed directory
const dir = argv.d || argv.dir
// Makes sure it isn't null
if(dir)
    injection(platform.dir, argv.d || argv.dir);
// If it is, throw an error
else
    throw new Error("Expected -d or --dir flag with ReGuilded's directory")