import yargs from "yargs";
import platform from "./platform.js";
import injection from "./injection.js";

const { argv } = yargs

// Gets passed directory
const dir = argv.d || argv.dir

if(dir)
    injection(platform.dir, argv.d || argv.dir);
else
    throw new Error("Expected -d or --dir flag with ReGuilded's directory")