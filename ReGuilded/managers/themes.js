const { existsSync, readFileSync, readFile, stat } = require("fs");
const ExtensionManager = require("./extension.js");
const { FileWatcher } = require("../utils");
const path = require("path");

/**
 * Manager that manages ReGuilded's themes
 */
module.exports = class ThemesManager extends ExtensionManager {
    /**
     * Manager that manages ReGuilded's themes
     * @param {String} themesDir The directory of the ReGuilded themes
     */
    constructor(themesDir) {
        super(themesDir);
        this.on("fullLoad", e => console.log("Full load"));
    }

    /**
     * Initiates themes and theme manager
     * @param {String[]} enabled An array of enabled themes
     */
    init(enabled = []) {
        // Make sure <sgroup> elements are ignored
        const reGuildedGroup = document.createElement("sgroup");
        reGuildedGroup.id = "reGl-main";
        const reGuildedStyle = document.createElement("style");
        reGuildedStyle.innerHTML = "sgroup{display:none;}";

        reGuildedGroup.appendChild(reGuildedStyle)
        document.head.appendChild(reGuildedGroup)

        const themes = super.getDirs(enabled);

        for (let i in themes) {
            const theme = themes[i],
                  // Creates path to the Theme Directory
                  themePath = super.getPath(theme.name),
                  jsonPath = path.join(themePath, "theme.json");

            // If json doesn't exist, ignore this directory
            stat(jsonPath, (e, _) => {
                checkTheme: {
                    if (e) {
                        // If it doesn't exist ignore it
                        if (e.code === 'ENOENT') break checkTheme;
                        else throw e;
                    }
                    const json = require(jsonPath);
                    // For re-use
                    json.dirname = themePath;

                    const propId = json.id;
                    // Checks if ID is correct
                    ExtensionManager.checkId(propId, jsonPath);

                    const propCss = typeof json.css === "string" ? [json.css] : json.css;

                    // Since we turned string into single-item array,
                    // we don't need to check for both types
                    if(!Array.isArray(propCss))
                        throw new TypeError(`Expected property 'css' to be either a string or an array. In path: ${jsonPath}`);

                    for(let css of propCss) {
                        const cssPath = getCssPath(json, css);

                        if (!existsSync(cssPath))
                            throw new Error(`Could not find CSS file in path ${cssPath}`);
                    }
                    // For later checks
                    json.css = propCss
                    
                    this.all.push(json);
                    // Loads it
                    if(this.enabled.includes(propId)) {
                        this.load(json);
                        this.emit("load", json);
                    }
                }
                // Checks if it's the last item
                this.checkLoaded(i, themes.length);
            })
        }
    }

    /**
     * Loads a ReGuilded theme
     * @param {{id: String, name: String, dirname: String, css: String[]}} theme ReGuilded theme to load
     */
    load(theme) {
        console.log(`Loading theme by ID '${theme.id}'`);

        // Theme watchers that will update the theme when it changes
        theme.watchers = []

        // Creates a new style element for that theme
        const group = document.createElement("sgroup");
        group.id = `reGl-theme-${theme.id}`;
        group.classList.add("reGl-theme");

        for(let css of theme.css) {
            const cssPath = getCssPath(theme, css)
            // Create watcher for this file
            theme.watchers.push(new FileWatcher(cssPath, this.reload.bind(this), theme.id));

            readFile(cssPath, { encoding: 'utf8' }, (e, d) => {

                if(e) throw e
                // Create style element based on each CSS file
                const style = document.createElement("style");
                style.classList.value = "reGl-css reGl-css-theme";
                style.innerHTML = d

                group.appendChild(style)
            })
        }

        document.body.appendChild(group);
    }

    /**
     * Unloads a ReGuilded theme.
     * @param {String} theme ID of the theme to unload from Guilded.
     */
    unload(theme) {
        console.log(`Unloading theme by ID '${theme}'`);

        document
            .querySelector(`body sgroup#reGl-theme-${theme}`)
            .remove();
    }
    /**
     * Reloads a ReGuilded theme.
     * @param {String} id The identifier of the theme
     */
    reload(id) {
        console.log(`Reloading theme by ID '${id}`);

        const theme = this.all.find((object) => object.id === id);

        // Style group
        const group = document.getElementById(`reGl-theme-${theme.id}`);

        for(let i in theme.css) {
            const css = theme.css[i],
                  style = group.childNodes[i]

            readFile(getCssPath(theme, css), { encoding: 'utf8' }, (e, d) => {
                if(e) throw e

                style.innerHTML = d
            })
        }
    }

    /**
     * Checks if given theme based on ID is loaded.
     * @param {String} id The identifier of the theme
     * @returns Theme is loaded
     */
    isLoaded(id) {
        return this.enabled.includes(id);
    }
};
/**
 * Gets CSS path relative to the given theme.
 * @param {{dirname: string}} theme The parent theme of used CSS file.
 * @param {string} css The path to CSS file.
 * @returns Absolute path
 */
function getCssPath(theme, css) {
    return path.isAbsolute(css) ? css : path.join(theme.dirname, css)
}
/**
 * A Regex pattern for determining whether given theme's ID is correct.
 */
module.exports.idRegex = /^[A-Za-z0-9]+$/g;
