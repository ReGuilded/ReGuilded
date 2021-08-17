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
        // Append it to head
        reGuildedGroup.appendChild(reGuildedStyle)
        document.head.appendChild(reGuildedGroup)

        // Gets a list of theme directories
        const themes = super.getDirs(enabled);

        // Gets every theme directory
        for (let i in themes) {
            const theme = themes[i]
            // Creates path to the Theme Directory
            const themePath = super.getPath(theme.name);
            // Gets path of the JSON
            const jsonPath = path.join(themePath, "theme.json");

            // If json doesn't exist, ignore this directory
            stat(jsonPath, (e, _) => {
                checkTheme: {
                    if (e) {
                        // If it doesn't exist ignore it
                        if (e.code === 'ENOENT') break checkTheme;
                        // If there is other kind of an error, throw it
                        else throw e;
                    }
                    // Get that json
                    const json = require(jsonPath);
                    // Sets directory's name
                    json.dirname = themePath;

                    // Gets ID property
                    const propId = json.id;
                    // Checks if ID is correct
                    ExtensionManager.checkId(propId, jsonPath);

                    // Gets CSS path
                    const propCss = typeof json.css === "string" ? [json.css] : json.css;
                    // Make sure it's an array
                    if(!Array.isArray(propCss))
                        throw new TypeError(`Expected property 'css' to be either a string or an array. In path: ${jsonPath}`);
                    // Check each CSS file
                    for(let css of propCss) {
                        // Gets full CSS path
                        const cssPath = getCssPath(json, css);
                        // Checks if CSS file exists
                        if (!existsSync(cssPath))
                            throw new Error(`Could not find CSS file in path ${cssPath}`);
                    }
                    // Change it for later checks
                    json.css = propCss
                    // Adds it to themes array instead
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
        // Creates path to the Theme Directory
        theme.watchers = []
        //const themeCss = path.join(theme.dirname, theme.css);
        
        // Creates a new style element for that theme
        const group = document.createElement("sgroup");
        group.id = `reGl-theme-${theme.id}`;
        group.classList.add("reGl-theme");
        
        // Get each CSS file
        for(let css of theme.css) {
            // And get its path,
            const cssPath = getCssPath(theme, css)
            // Create watcher for this file
            theme.watchers.push(new FileWatcher(cssPath, this.reload.bind(this), theme.id));
            // Then get file's contents
            readFile(cssPath, { encoding: 'utf8' }, (e, d) => {
                // Check for any errors
                if(e) throw e
                // Create style element based on it
                const style = document.createElement("style");
                style.classList.value = "reGl-css reGl-css-theme";
                style.innerHTML = d
                // And append it to a style group
                group.appendChild(style)
            })
        }

        // Adds style group element at the start of the body
        document.body.appendChild(group);
    }

    /**
     * Unloads a ReGuilded theme.
     * @param {String} theme ID of the theme to unload from Guilded.
     */
    unload(theme) {
        console.log(`Unloading theme by ID '${theme}'`);
        // Selects the theme's link element by name that is in body element
        const linkRef = document.querySelector(`body sgroup#reGl-theme-${theme}`);
        // Removes it
        linkRef.remove();
    }
    /**
     * Reloads a ReGuilded theme.
     * @param {String} id The identifier of the theme
     */
    reload(id) {
        console.log(`Reloading theme by ID '${id}`);

        // Gets the Theme, Theme Path, and Theme Css.
        const theme = this.all.find((object) => object.id === id);
        //const themeCss = path.join(theme.dirname, theme.css);

        // Gets the style group of that theme
        const group = document.getElementById(`reGl-theme-${theme.id}`);
        // Foreach CSS file there is,
        for(let i in theme.css) {
            // Get CSS and Style elements
            const css = theme.css[i], style = group.childNodes[i]
            // Get CSS file's contents
            readFile(getCssPath(theme, css), { encoding: 'utf8' }, (e, d) => {
                // And throw any errors
                if(e) throw e
                // Set it as style element's content
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
