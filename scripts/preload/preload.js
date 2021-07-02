const { ipcRenderer } = require("electron");

const ReGuilded = require("../../ReGuilded");
// Gets things for tinkering with Webpack
const webpackPush = require('./webpackInject.js')

global.ReGuilded = new ReGuilded();

if (document.readyState === "loading") {
    // Once DOM loads, initiate ReGuilded
    document.addEventListener("DOMContentLoaded", () => {
        global.ReGuilded.init()
    });
} else {
    global.ReGuilded.init();
}

document.addEventListener('readystatechange', () => {
    // When bundle loads
    if(document.readyState === 'interactive') {
        global.bundle.addEventListener('load', () => {
            // Saves the old push
            global.webpackJsonp._push = global.webpackJsonp.push
            // Replaces the push function with injected
            Object.defineProperty(global.webpackJsonp, 'push', {
                get: () => webpackPush
            })
        })
    }
})


const preload = ipcRenderer.sendSync('REGUILDED_GET_PRELOAD');
if (preload) {
    require(preload);
}