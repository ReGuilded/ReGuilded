/**
 * Code here can be originally be found from Powercord, Discord Client Mod.
 *
 * This credit goes to all module files that may seem the same as well.
 *
 * Original:
 * https://github.com/powercord-org/powercord/blob/1bf24bf87b417d22851a77d1e009d25cba493818/src/patcher.js
 */

// Modules
import { readFileSync, access } from "fs";
import ReGuildedWindow from "./reguilded-window";
import { platform, getuid, exit } from "process";
import { ipcMain, app, session } from "electron";
import { join, dirname } from "path";
import * as electron from "electron";
import { _load } from "module";

// Ensures application isn't ran as root on linux
if (platform === "linux" && getuid() === 0) {
    console.warn(
        "\x1b[1m\x1b[33m%s\x1b[0m",
        "Seems this application was ran as root, it has been closed by ReGuilded to prevent issues, run as a regular user instead!"
    );
    exit(1);
}

// Gets settings path
const settingsPath = join(process.env.APPDATA || process.env.HOME, ".reguilded");

// Electron
const electronPath = require.resolve("electron");

// Guilded's app.asar & package.json
const guildedPath = join(dirname(require.main.filename), "..", "_guilded", "app.asar");
const guildedPackage = JSON.parse(readFileSync(join(guildedPath, "package.json"), { encoding: "utf8" }));
require.main.filename = join(guildedPath, "main.js");

ipcMain.on("reguilded-preload", event => {
    event.returnValue = event.sender.guildedPreload;
});
ipcMain.handle("reguilded-extension-dialog", async (_, type) => {
    return await electron.dialog
        .showOpenDialog(electron.BrowserWindow.getFocusedWindow(), {
            title: `Import ${type}`,
            buttonLabel: "Import",
            properties: ["openDirectory", "multiSelections"]
        })
        .then(({ filePaths, canceled }) => ({ filePaths, canceled }))
        .catch(e => console.error("Patcher dialog error", e));
});
ipcMain.handle("reguilded-no-splash-close", () => {
    require.cache[
        join(dirname(require.main.filename), "electron", "electronAppLoader.js")
    ].exports.default.loaderWindow.close = () => {};
});

app.whenReady().then(() => {
    const _webRequest = session.defaultSession.webRequest;
    const filter = {
        urls: ["https://www.guilded.gg/*"]
    };
    const cspWhitelist = {
        connectSrc: [
            "https://raw.githubusercontent.com", // Github (Raw)
            "https://api.github.com", // Github API
            "https://www.github.com", // Github
            "https://objects.githubusercontent.com", // Github (Asset)
            "https://*.reguilded.dev" // ReGuilded Server
        ],
        // defaultSrc apparently ignored when more specific directive exists in CSP for attempted purpose
        defaultSrc: [
            "https://*.reguilded.dev" // ReGuilded Server
        ],
        fontSrc: [
            "https://fonts.gstatic.com", // Google Fonts
            "https://*.github.io", // GitLab Pages
            "https://*.gitlab.io", // GitHub Pages
            "https://*.gitea.io" // Gitea
        ],
        imgSrc: [
            "https://dl.dropboxusercontent.com", // Dropbox
            "https://*.google.com", // Google (includes Google Drive)
            "https://i.imgur.com", // Imgur
            "https://c.tenor.com", // Tenor
            "https://*.giphy.com", // Giphy
            "https://img.icons8.com", // Icons8
            "https://*.github.io", // Github Pages
            "https://*.gitlab.io", // Gitlab Pages
            "https://*.github.com", // Github
            "https://*.gitlab.com", // Gitlab
            "https://*.gitea.io" // Gitea
        ],
        mediaSrc: [],
        scriptSrc: [],
        styleSrc: [
            "https://fonts.googleapis.com", // Google Fonts
            "https://*.guilded.gg", // Guilded
            "https://*.github.io", // Github Pages
            "https://*.gitlab.io", // Gitlab Pages
            "https://*.gitea.io" // Gitea
        ]
    };
    // Fetches/Creates Custom CSP Whitelist Config
    let customCspWhitelist = {
        connectSrc: [],
        defaultSrc: [],
        fontSrc: [],
        imgSrc: [],
        mediaSrc: [],
        scriptSrc: [],
        styleSrc: []
    };
    const customWhitelistPath = join(settingsPath, "custom-csp-whitelist.json");
    new Promise((resolve) => {
        access(customWhitelistPath, err => {
            if (!err) {
                customCspWhitelist = require(customWhitelistPath);
            }

            resolve();
        });
    })
    .then(() => {
        const patchCSP = (customCspWhitelistParam = customCspWhitelist) => {
            _webRequest.onHeadersReceived(filter, (details, callback) => {
                const patchedCallback = headers => {
                    callback({
                        cancel: false,
                        responseHeaders: headers
                    });
                };
                const csp = {
                    permissive: details.responseHeaders["content-security-policy-report-only"],
                    enforcing: details.responseHeaders["content-security-policy"],
                    patch: async (policy, enforcing) => {
                        const originalPolicy = policy;
                        let modifiedPolicyStr = originalPolicy[0];

                        modifiedPolicyStr = modifiedPolicyStr.replace(/report\-uri.*?;/, " ");

                        for (const entry in cspWhitelist) {
                            let directive = entry.split("Src").join("-src");
                            let directiveWhiteListStr = cspWhitelist[entry].join(" ");

                            // Uses elem variant of directive if found, otherwise leaves it as-is
                            if (modifiedPolicyStr.includes(`${directive}-elem`)) directive = `${directive}-elem`;
                            
                            // If directive (-elem or otherwise) is still not found, just append to defaultSrc, failing that make it from scratch
                            if (modifiedPolicyStr.includes(directive))
                                modifiedPolicyStr = modifiedPolicyStr.replace(
                                    directive,
                                    `${directive} ${directiveWhiteListStr}`
                                );
                            else if (modifiedPolicyStr.includes('defaultSrc'))
                                modifiedPolicyStr = modifiedPolicyStr.replace(
                                    'defaultSrc',
                                    `defaultSrc ${directiveWhiteListStr}`
                                )                                
                            else modifiedPolicyStr.concat(` defaultSrc ${directiveWhiteListStr}`);
                        }

                        const modifiedPolicy = [modifiedPolicyStr];

                        if (enforcing)
                            details.responseHeaders["content-security-policy"] = modifiedPolicy;
                        else 
                            details.responseHeaders["content-security-policy-report-only"] = modifiedPolicy;

                        return details.responseHeaders;
                    }
                };

                if (!csp.permissive && !csp.enforcing) return callback({ cancel: false });

                if (csp.permissive) csp.patch(csp.permissive, false).then(patchedHeaders => patchedCallback(patchedHeaders));

                if (csp.enforcing) csp.patch(csp.enforcing, true).then(patchedHeaders => patchedCallback(patchedHeaders));
            });
            // Apply Custom Whitelist
            for (const directive in customCspWhitelistParam) {
                cspWhitelist[directive] = cspWhitelist[directive].concat(customCspWhitelist[directive]);
            }
            console.log(cspWhitelist);
        };

        // Patch CSP (Content-Security-Policy)
        try {
            patchCSP();
            ipcMain.handle("reguilded-repatch-csp", (...args) => {
                const updatedCustomCSPWhitelist = JSON.parse(args[1]);
                patchCSP(updatedCustomCSPWhitelist);
            });
        } catch (err) {
            console.error(err);
        }
    })
    .catch(err => console.log(err));
});

// Create Electron clone with modified BrowserWindow to inject ReGuilded preload
const overridenElectron = Object.assign(Object.assign({}, electron));

Object.defineProperty(overridenElectron, "BrowserWindow", {
    get() {
        return ReGuildedWindow;
    }
});

// Override Electron module
const electronModule = require.cache[electronPath];

delete electronModule.exports;
electronModule.exports = overridenElectron;

// Set App Path, App Name & App Version, then Launch Guilded.
electron.app.name = guildedPackage.name;
electron.app.setAppPath(guildedPath);
electron.app.setVersion(guildedPackage.version);
_load(join(guildedPath, guildedPackage.main), null, true);
