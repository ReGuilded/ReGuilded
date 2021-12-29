import injection from "../util/injection.js";
import platform from "../util/platform.js";
import minimist from "minimist";

const argv: { _: string[], d?: string, dir?: string } = minimist(process.argv.slice(2));

// Gets passed directory
const dir: string = argv.d || argv.dir;

if(dir) injection(platform.dir, argv.d || argv.dir);
else throw new Error("Expected -d or --dir flag with ReGuilded's directory");