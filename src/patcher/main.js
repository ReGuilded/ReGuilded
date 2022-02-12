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
ipcMain.handle("reguilded-enhancement-dialog", async (_, type) => {
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
        all: [],
        connect: [
            "raw.githubusercontent.com", // Github (Raw)
            "api.github.com", // Github API
            "www.github.com", // Github
            "objects.githubusercontent.com", // Github (Asset)
            "*.reguilded.dev" // ReGuilded Server
        ],
        default: [
            "*.reguilded.dev" // ReGuilded Server
        ],
        font: [
            "fonts.gstatic.com", // Google Fonts
            "*.github.io", // GitLab Pages
            "*.gitlab.io", // GitHub Pages
            "*.gitea.io" // Gitea
        ],
        img: [
            "dl.dropboxusercontent.com", // Dropbox
            "*.google.com", // Google (includes Google Drive)
            "i.imgur.com", // Imgur
            "c.tenor.com", // Tenor
            "*.giphy.com", // Giphy
            "img.icons8.com", // Icons8
            "*.github.io", // Github Pages
            "*.gitlab.io", // Gitlab Pages
            "*.github.com", // Github
            "*.gitlab.com", // Gitlab
            "*.gitea.io" // Gitea
        ],
        media: [],
        script: [],
        style: [
            "fonts.googleapis.com", // Google Fonts
            "*.guilded.gg", // Guilded
            "*.github.io", // Github Pages
            "*.gitlab.io", // Gitlab Pages
            "*.gitea.io" // Gitea
        ]
    };
    // Fetches/Creates Custom CSP Whitelist Config
    let customCspWhitelist = {
        all: [],
        connect: [],
        default: [],
        font: [],
        img: [],
        media: [],
        script: [],
        style: []
    };
    const customWhitelistPath = join(settingsPath, "custom-csp-whitelist.json");
    new Promise(resolve => {
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
                        callback({ responseHeaders: headers });
                    };
                    const csp = {
                        permissive: details.responseHeaders["content-security-policy-report-only"],
                        enforcing: details.responseHeaders["content-security-policy"],
                        patch: async (policy, enforcing) => {
                            const originalPolicy = policy;
                            let modifiedPolicyStr = originalPolicy[0];

                            modifiedPolicyStr = modifiedPolicyStr.replace(/report\-uri.*?;/, " ");

                            for (const entry in cspWhitelist) {
                                let directive = `${entry}-src`,
                                    directiveWhiteListStr = cspWhitelist[entry].concat(cspWhitelist["all"]).join(" ");

                                // Uses elem variant of directive if found, otherwise leaves it as-is
                                if (modifiedPolicyStr.includes(`${directive}-elem`)) directive = `${directive}-elem`;

                                // If directive (-elem or otherwise) is still not found, just append to default-src, failing that make it from scratch
                                if (entry !== "all") {
                                    if (modifiedPolicyStr.includes(directive))
                                        modifiedPolicyStr = modifiedPolicyStr.replace(
                                            directive,
                                            `${directive} ${directiveWhiteListStr}`
                                        );
                                    else if (modifiedPolicyStr.includes("default-src"))
                                        modifiedPolicyStr = modifiedPolicyStr.replace(
                                            "default-src",
                                            `default-src ${directiveWhiteListStr}`
                                        );
                                    else modifiedPolicyStr.concat(` default-src ${directiveWhiteListStr}`);
                                }
                            }

                            const modifiedPolicy = [modifiedPolicyStr];

                            if (enforcing) details.responseHeaders["content-security-policy"] = modifiedPolicy;
                            else details.responseHeaders["content-security-policy-report-only"] = modifiedPolicy;

                            return details.responseHeaders;
                        }
                    };

                    if (!csp.permissive && !csp.enforcing) return callback({});

                    if (csp.permissive)
                        csp.patch(csp.permissive, false).then(patchedHeaders => patchedCallback(patchedHeaders));

                    if (csp.enforcing)
                        csp.patch(csp.enforcing, true).then(patchedHeaders => patchedCallback(patchedHeaders));
                });
                // Apply Custom Whitelist
                for (const directive in customCspWhitelistParam) {
                    if (directive !== "all")
                        cspWhitelist[directive] = cspWhitelist[directive]
                            .concat(customCspWhitelist[directive])
                            .concat(customCspWhitelist["all"]);
                }
            };

            // Patch CSP (Content-Security-Policy)
            try {
                patchCSP();
                /* ipcMain.handle("reguilded-repatch-csp", (...args) => {
                const updatedCustomCSPWhitelist = JSON.parse(args[1]);
                patchCSP(updatedCustomCSPWhitelist);
            }); */
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
