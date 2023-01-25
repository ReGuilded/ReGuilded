// Modules
import { closeGuildedCommand, getResourcesDir, openGuildedCommand } from "./util/utilFunctions";
import { access, mkdir, rmdir, constants } from "fs/promises";
import { exec as sudoExec } from "sudo-prompt";
import platform from "./util/platform";
import { exec } from "child_process";
import { join } from "path";
import tasks from "./tasks";

// Types
import type { UtilInfo } from "../typings";

/**
 * Ignored because Webstorm won't detect `esModuleInterop` in our TSConfig in rollup.config.js
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import minimist from "minimist";

/**
 * Command Line Arguments:
 *  * `--task` -- "inject/uninject/update"
 *  * `--rgDir` -- ReGuilded Directory
 *  * `--gilDir` -- Custom Guilded Location
 *  * `--gilAppName` -- Custom Guilded App Name
 *  * `--debug` -- Extra debugging info
 *
 * Guilded App Name Example:
 *  * Windows -- "Guilded"
 *  * Darwin/Linux -- "guilded"
 *
 * Command Example(s):
 *  * `npm run inject` -- Runs inject task with default locations.
 *  * `npm run inject -- --rgDir "path/to/custom/reguilded/location" --gilDir "path/to/custom/guilded/location" --gilAppName "CustomGuildedName"`
 */
const argv: {
  _: string[];
  task?: string;
  rgDir?: string;
  gilDir?: string;
  gilAppName?: string;
  debug?: boolean;
} = minimist(process.argv.slice(2));
argv.debug && console.log("Arguments:", argv);

if (!argv.task || !["inject", "uninject", "update"].includes(argv.task.toLowerCase()))
  throw new Error("`task` argument is missing or incorrect. It can either be `inject, uninject, or update`");
if (argv.gilDir && !argv.gilAppName)
  throw new Error("gilAppName must be set when using a custom Guilded Directory Location");

argv.task = argv.task.toLowerCase();

if (!platform) throw new Error(`Unsupported platform, ${process.platform}`);

/**
 * Generate a utilInfo object, that will contain directories and commands.
 * We generate this from either provided arguments or default platform (./util/platform.ts)
 */
const utilInfo: UtilInfo = {
  guildedAppName: argv.gilAppName || platform.guildedAppName,
  reguildedDir: argv.rgDir || platform.reguildedDir,
  guildedDir: argv.gilDir || platform.guildedDir,

  resourcesDir: undefined,
  closeCommand: undefined,
  openCommand: undefined,
  appDir: undefined
};

/**
 * Function to elevate the process using the `sudo-prompt` module.
 * We rerun the end command that the User ran, so all arguments are used.
 */
function elevate(): void {
  console.error(`Task ${argv.task}, requires elevated privileges, please complete the prompt that has opened.`);

  argv.debug && console.log(`Elevation-Command: ${process.argv.map((x) => JSON.stringify(x)).join(" ")}`);
  sudoExec(process.argv.map((x) => JSON.stringify(x)).join(" "), { name: "ReGuilded" }, (err, stdout, stderr) => {
    if (err) console.error(`There was an error while attempting to run task ${argv.task}:\n${err}\n${stderr}`);

    console.log(stdout);
  });
}

/**
 * Function used to check if Guilded is still running.
 * We use this because Guilded can take a moment to fully close on some platforms.
 *
 * Source from StackOverflow:
 * https://stackoverflow.com/a/47996795/14981012
 */
function isGuildedRunning() {
  return new Promise(function (resolve) {
    const cmd = (() => {
      switch (process.platform) {
        case "win32":
          return `tasklist`;
        case "darwin":
          return `ps -ax | grep ${utilInfo.guildedAppName}`;
        case "linux":
          return `ps -A`;
        default:
          resolve(false);
      }
    })();

    exec(cmd, function (err, stdout) {
      resolve(stdout.toLowerCase().indexOf(utilInfo.guildedAppName.toLowerCase()) > -1);
    });
  });
}

/**
 * Async function so we can await the util functions. (Since they're kind-of important.)
 */
(async function () {
  // Populate utilInfo object.
  utilInfo.openCommand = await openGuildedCommand(utilInfo.guildedAppName, utilInfo.guildedDir);
  utilInfo.closeCommand = await closeGuildedCommand(utilInfo.guildedAppName);
  utilInfo.resourcesDir = await getResourcesDir(utilInfo.guildedDir);
  if (!utilInfo.openCommand || !utilInfo.closeCommand || !utilInfo.resourcesDir)
    throw new Error(`Unsupported platform, ${process.platform}`);
  utilInfo.appDir = join(utilInfo.resourcesDir, "app");

  argv.debug && console.log("Util-Info:", utilInfo);

  /**
   * Checking if ReGuilded is injected yet or not. This goes of if the `resources/app` directory exists.
   * If there is no error and the task is `inject`, then the `resources/app` directory does exist.
   * If there is an error and the task is `uninject`, then the `resources/app` directory does not exist.
   */
  try {
    await access(utilInfo.appDir, constants.F_OK);

    if (argv.task === "inject")
      return console.error(`Called Inject, but ReGuilded is already injected at ${utilInfo.appDir}`);
  } catch (err) {
    if (argv.task === "uninject") return console.error(`Called Uninject, but ReGuilded is not injected`);
  }

  /**
   * Attempt to create a test directory in the parent directory of where the ReGuilded directory will be made.
   * If it's made successfully, we'll delete the directory right after.
   * If not, we'll return immediately and prompt for elevated privileges.
   */
  try {
    const testDir = join(utilInfo.reguildedDir, "../_rgTestDir");

    await mkdir(testDir);
    await rmdir(testDir, { recursive: false });
  } catch (err) {
    argv.debug && console.log("ReGuilded-Dir", err);
    return elevate();
  }

  /**
   * Attempt to create a test directory in the Resources Directory of Guilded.
   * If it's made successfully, we'll delete the directory right after.
   * If not, we'll return immediately and prompt for elevated privileges.
   */
  try {
    const testDir = join(utilInfo.resourcesDir, "_rgTestDir");

    await mkdir(testDir);
    await rmdir(testDir, { recursive: false });
  } catch (err) {
    argv.debug && console.log("Resources-Dir", err);
    return elevate();
  }

  /**
   * Promise to Close Guilded if we have to.
   * This should only be done if we're injecting or uninjecting as this will interact with Guilded's ASAR.
   * Doing so while Guilded is running would result in an error, relating to the ASAR currently being in used.
   */
  new Promise<void>((resolve) => {
    if (["inject", "uninject"].includes(argv.task)) {
      // Relays to the user that Guilded needs to be closed, and closes Guilded.
      console.log(`Task ${argv.task} requires Guilded to be closed. Closing Guilded now...`);
      exec(utilInfo.closeCommand);

      // Creates an interval that is runs a check every 500ms (.5s) if Guilded is running.
      // If it is, we do nothing, therefore the check runs again.
      // If Guilded is closed, we resolve the promise, beginning the user's desired task.
      const closeCheckInterval = setInterval(() => {
        argv.debug && console.log("Checking if Guilded is Closed...");

        isGuildedRunning().then((isGuildedRunning) => {
          if (!isGuildedRunning) {
            clearInterval(closeCheckInterval);

            argv.debug && console.log("Guilded is Closed.");

            resolve();
          }
        });
      }, 500);
    } else resolve();
  }).then(async () => {
    argv.debug && console.log("Continuing Task...");

    try {
      await tasks[argv.task](utilInfo);
    } catch (err) {
      console.error(err);
    }

    exec(utilInfo.openCommand, (err, stdout, stderr) => {
      if (err || stderr) console.error(err || stderr);

      // FIX: Process not exiting.
      process.exit();
    });

    console.log(`Task ${argv.task} executed successfully!`);
  });
})();
