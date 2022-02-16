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
        ) {
            oldPreload = options.webPreferences.preload;
            options.webPreferences.preload = preloads.splash;
        } else if (options.webPreferences?.preload) {
            oldPreload = options.webPreferences.preload;
            options.webPreferences.preload = preloads.main;
        }

        super(options);

        // Implements devtools warning
        this.webContents.on("devtools-opened", () => {
            this.webContents
                .executeJavaScript(
                    `
                (async () => {
                    if (window.ReGuilded.settingsHandler.config.debugMode) return;
                    const warningStyles = "color: #cd3534;";
                    console.log("%cCAUTION!", \`\${warningStyles} font-weight:bold; font-size: 40px; line-height: 1em; color: #e7e7e7; background-color: #cd3534; border-radius: 4px; padding: 2px 8px\`);
                    console.log("%cDO NOT PASTE OR WRITE ANYTHING HERE IF YOU DON'T KNOW WHAT YOU ARE DOING. THIS MAY BE USED BY ATTACKERS FOR ANY MALICIOUS ACT.", \`\${warningStyles} font-size: 24px;\`);
                    console.log("%cIf however, you know what you are doing, consider contributing to ReGuilded (https://www.github.com/ReGuilded/ReGuilded) and/or making addons and themes.", \`\${warningStyles} font-size: 16px;\`)
                })();
            `
                )
                .catch(err => console.error(err));
        });

        this.webContents.guildedPreload = oldPreload;
    }
}
