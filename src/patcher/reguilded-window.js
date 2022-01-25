import * as electron from "electron";
import { join } from "path";
import { readFileSync } from "fs";

const userDataDir = process.env.APPDATA || process.env.HOME;
let settingsParentDir;
if(!__dirname.startsWith(userDataDir)) {
    const configDir = join(userDataDir, ".reguilded");
    settingsParentDir = configDir;
} else settingsParentDir = join(__dirname, "..");

const devToolsForceEnable = process.argv[1] === "--reguilded-enable-devtools-i-know-what-im-doing";

const settingsPath = join(settingsParentDir, "./settings");

let settings = {};
try {
    settings = JSON.parse(readFileSync(join(settingsPath, "settings.json"), { encoding: "utf8" }))
} catch(err) {
    console.log("Settings doesn't exists yet, must be first time.");
};

const preloads = {
    main: join(__dirname, "./electron.preload.js"),
    splash: join(__dirname, "./electron.preload-splash.js")
};

export default class ReGuildedWindow extends electron.BrowserWindow {
    /** @param {import("electron").BrowserWindowConstructorOptions} options  */
    constructor(options) {
        // Blocks devtools by default
        options.webPreferences.devTools = devToolsForceEnable || settings.devTools || false;

        // Save old Guilded preload to later use it
        let oldPreload;

        // To determine whether it's loading screen
        if (
            options.webPreferences &&
            "resizable" in options &&
            !options.resizable &&
            "maximizable" in options &&
            !options.maximizable
        )
            options.webPreferences.preload = preloads.splash;
        else if (options.webPreferences?.preload) {
            oldPreload = options.webPreferences.preload;
            options.webPreferences.preload = preloads.main;
        }

        super(options);

        // This prevents Guilded from crashing when clicking on non-Guilded links
        // Apparently, ReGuilded's preload gets loaded when link is clicked and the renderer's webFrame
        // gets immediately disposed
        this.webContents.setWindowOpenHandler(({ url }) => {
            // Replace the default window opener with openExternal
            electron.shell.openExternal(url);
            return { action: "deny" };
        });

        this.webContents.guildedPreload = oldPreload;
    }
}