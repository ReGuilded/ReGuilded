import injection from "../util/injection.js";
import uninjection from "../util/uninjection.js";
import platform from "../util/platform.js";
import minimist from "minimist";
import { inject } from "../tasks.js";

const argv: { _: string[], d?: string, dir?: string, t?: string, task?: string  } = minimist(process.argv.slice(2));

// Gets passed directory
const dir: string = argv.d || argv.dir;
const task: string = argv.t || argv.task;

if (dir && task == "inject") injection(platform, dir)
else if (dir && task == "injectInProtectedFolder") inject(platform, dir)
else if (dir && task === "uninject") uninjection(platform, dir)
else throw new Error("Expected -d or --dir flag with ReGuilded's directory");