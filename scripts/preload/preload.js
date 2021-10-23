const { members } = require("../../ReGuilded/badges-flairs.js");
const { access, mkdir, writeFile } = require("fs");
const { ipcRenderer } = require("electron");
const { join } = require("path");

// Get ReGuilded's class.
const ReGuilded = require("../../ReGuilded");
// Gets things for tinkering with Webpack
const webpackPush = require("./webpackInject.js");

let SettingsPromise = function handleSettings() {
    return new Promise((resolve, reject) => {
        const settingsPath = join(__dirname, "../../settings");

        access(settingsPath, err => {
            if (err) {
                global.firstLaunch = true;

                // Create ~/.reguilded/settings
                mkdir(settingsPath, { recursive: true, }, (e, p) => {
                    if (e) throw e;

                    const settingsJson = JSON.stringify({
                        themes: {
                            enabled: []
                        },
                        addons: {
                            enabled: []
                        }
                    });

                    // Create settings.json, themes and addons, which are completely empty
                    writeFile(join(p, "settings.json"), settingsJson, { encoding: 'utf8' }, e => {
                        if (e) throw e;
                    });
                    // If more will be necessary, use for of
                    mkdir(join(p, "themes"), e => {
                        if (e) throw e
                    });
                    mkdir(join(p, "addons"), e => {
                        if (e) throw e
                    });
                });
            } else resolve();
        });
    })
}

SettingsPromise().then(() => {
    global.ReGuilded = new ReGuilded();

    const preload = ipcRenderer.sendSync("REGUILDED_GET_PRELOAD");
    if (preload) {
        require(preload);
    }
}).catch((err) => {
    console.error(err);
});

function setPush(obj) {
    Object.defineProperty(global.webpackJsonp, "push", obj)
}

document.addEventListener("readystatechange", () => {
    // To wait for the bundle to be created
    if (document.readyState === "interactive")
        // Wait when bundle loads
        global.bundle.addEventListener("load", () => {
            // Saves the old push
            global.webpackJsonp._push = global.webpackJsonp.push;

            setPush({
                get: () => webpackPush.bind(global.webpackJsonp),
                set: (value) => setPush({get: () => value})
            });
        });
});

// Fetches ReGuilded developer list
fetch("https://raw.githubusercontent.com/ReGuilded/ReGuilded-Website/main/ReGuilded/wwwroot/maintainers.json")
    .then(x => x.json())
    .then(x => {
        members.dev = x.developers;
        members.contrib = x.contributors;
    });