const { ipcRenderer } = require("electron");

const ReGuilded = require("../../ReGuilded");
// Gets things for tinkering with Webpack
const webpackPush = require("./webpackInject.js");

global.ReGuilded = new ReGuilded();

document.addEventListener("readystatechange", () => {
    // When document is interactive, start loading JS stuff
    if (document.readyState === "interactive") {
        // Wait when bundle loads
        global.bundle.addEventListener("load", () => {
            // Saves the old push
            global.webpackJsonp._push = global.webpackJsonp.push;
            // Replaces the push function with injected
            Object.defineProperty(global.webpackJsonp, "push", {
                get: () => webpackPush,
            });
        });
    }
});

const preload = ipcRenderer.sendSync("REGUILDED_GET_PRELOAD");
if (preload) {
    require(preload);
}
