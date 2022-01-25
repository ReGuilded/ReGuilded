import platform from "./util/platform";
import { exec, execFile } from "child_process";
import { exec as sudoExec } from "sudo-prompt";
import * as tasks from "./tasks.js";
import minimist from "minimist";

const argv: { _: string[]; d?: string; dir?: string; e?: string; doas?: boolean; elevator?: string } = minimist(
    process.argv.slice(2)
);

// We only need these two since injectbare and uninjectbare don't actually ever run this script.
const specialTasks = ["inject", "uninject"];

(async function () {
    // Directory to install ReGuilded configuration to
    const dir = argv.d || argv.dir,
        elevator = argv.e || argv.elevator || (argv.doas ? "doas" : "sudo"),
        [taskArg] = argv._;

    // Disgusting code to test for Admin or Sudo perms.
    new Promise<boolean>((resolve) => {
        if (specialTasks.includes(taskArg)) {
            if (process.platform === "win32") {
                execFile("net", ["session"], (error) => {
                    if (error) resolve(true);
                    else resolve(false);
                });
            } else if (["linux", "darwin"].includes(process.platform) && process.getuid() && process.getuid() !== 0) resolve(true)
            else resolve(false);
        } else resolve(false);
    }).then((requireElevate) => {
        if (requireElevate) {
            console.error(`Task ${taskArg}, requires elevated privileges, please complete the prompt that has opened.`);

            sudoExec(process.argv.map(x => JSON.stringify(x)).join(" "), {name: "ReGuilded"}, (error, stdout) => {
                if (error) throw error
                console.log(stdout);
            });
        } else performTask();
    });

    function performTask() {
        // If task argument is null, return error
        if (taskArg === undefined) throw new Error("First argument expected");
        console.log("Performing task", taskArg);

        if (dir !== undefined && typeof dir !== "string") throw new TypeError("Argument -d or --dir must be a string");

        if (tasks[taskArg] !== null) {
            const restartNeeded = specialTasks.includes(taskArg);

            // Only close Guilded if the arguments are Injection or Uninjection related.
            new Promise<void>((resolve) => {
                if (restartNeeded) {
                    console.log("Force closing Guilded");
                    exec(platform.close).on("exit", resolve);
                } else resolve()
            }).then(() => {
                tasks[taskArg](platform, "sudo") // Custom elevator support disabled
                    .then(() => {
                        if (restartNeeded) {
                            console.info(`Task ${taskArg} is complete, and you can now relaunch Guilded.`)
                        }
                    })
                    .catch(err => {
                        console.error("Failed to do task", taskArg, ":", err);
                    });
            })
        } else console.error("Unknown task", taskArg);
    }
})();
