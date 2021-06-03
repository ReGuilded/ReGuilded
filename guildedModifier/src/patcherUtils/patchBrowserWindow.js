const { BrowserWindow } = require("electron");
const { join } = require("path");

const preload = join(__dirname, "../preload/preload.js");
const preloadSplash = join(__dirname, "../preload/preloadSplash.js");

module.exports = (electron, electronPathExports) => {
    const electronExports = new Proxy(electron, {
        get(target, prop) {
            switch(prop) {
                case 'BrowserWindow': return PatchedBrowserWindow;
                default: return target[prop];
            }
        }
    });

    delete electronPathExports;
    electronPathExports = electronExports;
}

class PatchedBrowserWindow extends BrowserWindow {

    constructor(options) {
        let origPreload;

        if (options.webPreferences && options.webPreferences.nodeIntegration) {
            options.webPreferences.preload = preloadSplash;
        } else if (options.webPreferences && options.webPreferences.offscreen) {
            originalPreload = options.webPreferences.preload;
        } else if (options.webPreferences && options.webPreferences.preload) {
            originalPreload = options.webPreferences.preload;

            if (options.webPreferences.nativeWindowOpen) {
                options.webPreferences.preload = preload;
            } else {
                options.webPreferences.preload = preloadSplash;
            }
        }
    
        const win = new BrowserWindow(options);
        const origLoadURL = win.loadURL.bind(win);

        Object.defineProperties(win, "loadUrl", {
            get: () => PatchedBrowserWindow.loadURL.bind(win, origLoadURL),
            configurable: true
        });

        win.webContents.reguildedPreload = origPreload;
        return win;
    }

    static loadURL(origLoadURL, URL, options) {
        origLoadURL(URL, options);
    }
    
}
