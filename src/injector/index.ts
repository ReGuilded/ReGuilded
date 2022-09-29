import { closeGuildedCommand, getResourcesDir, openGuildedCommand } from "./util/utilFunctions";
import platform from "./util/platform";
import minimist from "minimist";
import { join } from "path";

/**
 * Command Line Arguments:
 *  * `--task` -- "inject/uninject/update"
 *  * `--rgDir` -- Custom ReGuilded Location
 *  * `--gDir` -- Custom Guilded Location
 *  * `--gAppName` -- Custom Guilded App Name
 *
 * Guilded App Name Example:
 *  * Windows -- "Guilded"
 *  * Darwin/Linux -- "guilded"
 *
 * Command Example:
 *
 *  `npm run injector -- --task "inject" --rgDir "path/to/custom/reguilded/location" --gDir "path/to/custom/guilded/location" --gAppName "CustomGuildedName"`
 */
const argv: {
  _: string[];
  task?: string;
  rgDir?: string;
  gDir?: string;
  gAppName?: string;
} = minimist(process.argv.slice(2));

if (!argv.task && !["inject", "uninject", "update"].includes(argv.task.toLowerCase()))
  throw new Error("`task` argument is missing. It can either be `inject, uninject, or update`");
if (argv.gDir && !argv.gAppName)
  throw new Error("gAppName must be set when using a custom Guilded Directory Location");

/**
 * Generate a utilInfo object, that will contain directories and commands.
 * We generate this from either provided arguments or default platform (./util/platform.ts)
 */
const utilInfo: {
  guildedAppName: string;
  reguildedDir: string;
  resourcesDir: string;
  closeCommand: string;
  openCommand: string;
  guildedDir: string;
  appDir: string;
} = {
  guildedAppName: argv.gAppName || platform.guildedAppName,
  reguildedDir: argv.rgDir || platform.reguildedDir,
  guildedDir: argv.gDir || platform.guildedDir,

  resourcesDir: undefined,
  closeCommand: undefined,
  openCommand: undefined,
  appDir: undefined
};

/**
 * Async function so we can await the util functions. (Since they're kind-of important.)
 */
(async function () {
  utilInfo.openCommand = await openGuildedCommand(utilInfo.guildedAppName, utilInfo.guildedDir);
  utilInfo.closeCommand = await closeGuildedCommand(utilInfo.guildedAppName);
  utilInfo.resourcesDir = await getResourcesDir(utilInfo.guildedDir);
  utilInfo.appDir = join(utilInfo.resourcesDir, "app");

  console.log("TASK:", argv.task);
  console.log(utilInfo);
})();
