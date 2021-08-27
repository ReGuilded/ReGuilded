const copyDir = require("../../ReGuilded/libs/copy-dir");
const badges = require("../../ReGuilded/badges.js");
const { ipcRenderer } = require("electron");
const { access } = require("fs");
const { join } = require("path");

// Get ReGuilded's class.
const ReGuilded = require("../../ReGuilded");
// Gets things for tinkering with Webpack
const webpackPush = require("./webpackInject.js");

let SettingsPromise = function handleSettings() {
    return new Promise((resolve, reject) => {
        access(join(__dirname, "../../settings"), (err) => {
            if (err) {
                global.firstLaunch = true;

                copyDir(join(__dirname, "../../ReGuilded", "_defaultSettings"), join(__dirname, "../../settings"), (err) => {
                    if (err) return reject(err);
                    console.log("Successfully dropped settings");
                    resolve();
                })
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
    // When document is interactive, start loading JS stuff
    if (document.readyState === "interactive")
        // Wait when bundle loads
        global.bundle.addEventListener("load", () => {
            // Saves the old push
            global.webpackJsonp._push = global.webpackJsonp.push;
            // Replaces the push function with injected
            setPush({
                get: () => webpackPush.bind(global.webpackJsonp),
                set: (value) => setPush({get: () => value})
            });
        });
});

// Fetches ReGuilded developer list
fetch("https://raw.githubusercontent.com/ReGuilded/ReGuilded-Website/main/ReGuilded/wwwroot/maintainers.json")
    .then((x) => x.json())
    .then((x) => {
        badges.members.dev = x.developers;
        badges.members.contrib = x.contributors;
    });