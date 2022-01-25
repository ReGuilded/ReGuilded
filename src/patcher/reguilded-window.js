import * as electron from "electron";
import { join } from "path";

const preloads = {
    main: join(__dirname, "./electron.preload.js"),
    splash: join(__dirname, "./electron.preload-splash.js")
};

export default class ReGuildedWindow extends electron.BrowserWindow {
    /** @param {import("electron").BrowserWindowConstructorOptions} options  */
    constructor(options) {
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
