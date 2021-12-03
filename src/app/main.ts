//require("./libs/compiler/index.js").patchRequires();
import { members } from "./core/badges-flairs";
import { promises as fsPromises } from "fs";
import webpackPush from "./webpackInject";
import ReGuilded from "./core/ReGuilded";
import { ipcRenderer } from "electron";
import { join } from "path";

const { access, mkdir, writeFile } = fsPromises;

let SettingsPromise = function handleSettings() {
    return new Promise<void>((resolve, reject) => {
        const settingsPath = join(__dirname, "./settings");

        access(settingsPath).then(resolve).catch(e => {
            if (!e || !e.code || e.code !== "ENOENT") {
                reject(e);
                return;
            }

            // To do this properly, you're supposed to check the type of error. Fuck that, for now. Nah I'll fix it in a sec
            window.firstLaunch = true;

            // Create ~/.reguilded/settings
            mkdir(settingsPath, { recursive: true }).then(async () => {
                const settingsJson = JSON.stringify({
                    themes: {
                        enabled: []
                    },
                    addons: {
                        enabled: []
                    }
                }, null, 4);

                // Create the settings.json and an empty themes and addons folder
                await writeFile(join(settingsPath, "settings.json"), settingsJson, {encoding: "utf-8"});
                await mkdir(join(settingsPath, "themes"));
                await mkdir(join(settingsPath, "addons"));

                // Resolve
                resolve();
            });
        });
    });
};

SettingsPromise().then(() => {
    window.ReGuilded = new ReGuilded();

    const preload = ipcRenderer.sendSync("REGUILDED_GET_PRELOAD");
    if (preload) {
        require(preload);
    }
}).catch(console.error);

function setPush(obj) {
    Object.defineProperty(window.webpackJsonp, "push", obj)
}

document.addEventListener("readystatechange", () => {
    // To wait for the bundle to be created
    if (document.readyState === "interactive")
        // Wait when bundle loads
        window.bundle.addEventListener("load", () => {
            // Saves the old push
            window.webpackJsonp._push = window.webpackJsonp.push;

            setPush({
                get: () => webpackPush.bind(window.webpackJsonp),
                set: (value) => setPush({get: () => value})
            });
        });
});

// Fetches ReGuilded developer list
fetch("https://raw.githubusercontent.com/ReGuilded/ReGuilded-Website/main/ReGuilded/wwwroot/contributors.json").then((response) => {
    response.json().then((json) => {
        members.dev = json.filter(user => user.isCoreDeveloper)
        members.contrib = json.filter(user => user.isContributor)
    });
});