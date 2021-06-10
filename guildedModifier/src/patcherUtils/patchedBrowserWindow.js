const { BrowserWindow } = require("electron");
const { join } = require("path");

const preload = join(__dirname, "../preload/preload.js");
const preloadSplash = join(__dirname, "../preload/preloadSplash.js");

module.exports = class PatchedBrowserWindow extends BrowserWindow {
    // noinspection JSAnnotator
    constructor(options) {
        let origPreload;

        if (options.webPreferences && options.webPreferences.nodeIntegration) {
            options.webPreferences.preload = preloadSplash;
        } else if (options.webPreferences && options.webPreferences.offscreen) {
            origPreload = options.webPreferences.preload;
        } else if (options.webPreferences && options.webPreferences.preload) {
            origPreload = options.webPreferences.preload;

            if (options.webPreferences.nativeWindowOpen) {
                options.webPreferences.preload = preload;
            } else {
                options.webPreferences.preload = preloadSplash;
            }
        }

        const win = new BrowserWindow(options);
        const origLoadUrl = win.loadURL.bind(win);

        Object.defineProperty(win, 'loadURL', {
            get: () => PatchedBrowserWindow.loadUrl.bind(win, origLoadUrl),
            configurable: true
        });

        win.webContents.reguildedPreload = origPreload;
        return win;
    }

    static loadUrl(origLoadURL, URL, options) {
        return origLoadURL(URL, options);
    }

}
