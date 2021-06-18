const { ipcRenderer } = require("electron");

const ReGuilded = require("../ReGuilded/Index.js");
const badges = require("../ReGuilded/badges.js");

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
            // FIXME: NO SVGS ANYMORE BECAUSE OF THIS
            // Push a new module to it
            global.webpackJsonp.push([ [151], { 1390:
                (a, b, c) => {
                    // Start loading it
                    console.log('Loading')
                    // Makes `c` globally available
                    global.bundleGet = c
                    // Gets the User class
                    const {UserModel} = c(114)
                    // Generates function for getting badges
                    const badgeGetter = badges.genBadgeGetter(UserModel.prototype.__lookupGetter__('badges'))
                    // Adds ReGuilded staff badges
                    badges.injectBadgeGetter(UserModel.prototype, badgeGetter)
                }
            }])
        })
    }
})


const preload = ipcRenderer.sendSync('REGUILDED_GET_PRELOAD');
if (preload) {
    require(preload);
}