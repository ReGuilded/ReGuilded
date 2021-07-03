const { BrowserWindow } = require("electron");
const { join } = require("path");

const preload = join(__dirname, "../preload/preload.js");
const preloadSplash = join(__dirname, "../preload/preloadSplash.js");

module.exports = class PatchedBrowserWindow extends BrowserWindow {
    // noinspection JSAnnotator
    constructor(options) {
        // FIXME: Not broken, but this is weird
        let origPreload;

        // REVIEW: What is this supposed to fix/do? What
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
        // REVIEW: Why are we creating an instance of BrowserWindow in the instance of BrowserWindow's subclass? Why not use this instance?
        const win = new BrowserWindow(options);
        const origLoadUrl = win.loadURL.bind(win);

        Object.defineProperty(win, 'loadURL', {
            get: () => PatchedBrowserWindow.loadUrl.bind(win, origLoadUrl),
            configurable: true
        });
        // REVIEW: Why not use win.webContents.preload instead?
        win.webContents.reguildedPreload = origPreload;
        // REVIEW: Why are we using return in a constructor?
        return win;
    }

    static loadUrl(origLoadURL, URL, options) {
        return origLoadURL(URL, options);
    }

}
