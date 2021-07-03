const ExtensionManager = require("./extensionManager.js");
const { FileWatcher } = require("../Utils");
const path = require("path");
const { existsSync, readFileSync, stat } = require("fs");

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
    }

    /**
     * Initiates themes and theme manager
     * @param {String[]} enabled An array of enabled themes
     */
    init(enabled = []) {
        // Gets a list of theme directories
        const themes = super.getDirs(enabled);

        // Gets every theme directory
        for (let theme of themes) {
            // Creates path to the Theme Directory
            const themePath = super.getPath(theme.name);
            // Gets path of the JSON
            const jsonPath = path.join(themePath, "theme.json");

            // If json doesn't exist, ignore this directory
            stat(jsonPath, (e, _) => {
                if(e) {
                    // If it doesn't exist ignore it
                    if(e.code === 'ENOENT') return;
                    // If there is other kind of an error, throw it
                    else throw e;
                }
                // Get that json
                const json = require(jsonPath);
                // Sets directory's name
                json.dirname = themePath;
    
                // TODO: Use JSON schema
    
                // Gets ID property
                const propId = json.id;
                // Checks if ID is correct
                if (!ExtensionManager.checkId(propId)) throw new Error(`Incorrect syntax of the property 'id'.`);
    
                // Gets CSS path
                const propCss = json.css;
                // Checks if it's a string
                ExtensionManager.checkProperty("css", propCss, "string", jsonPath);
                // Gets full CSS path
                const cssPath = path.isAbsolute(propCss) ? propCss : path.join(themePath, propCss);
                // Checks if CSS file exists
                if (!existsSync(cssPath)) throw new Error(`Could not find CSS file in path ${cssPath}`);
    
                // Adds it to themes array instead
                this.all.push(json);
            })
        }

        // Wait 3 seconds to let Guilded's Styles load.
        setTimeout(
            function () {
                this.loadAll();
            }.bind(this),
            3000
        );
    }

    /**
     * Loads a ReGuilded theme
     * @param {{id: String, name: String, dirname: String, css: String}} theme ReGuilded theme to load
     */
    load(theme) {
        // Creates path to the Theme Directory
        const themeCss = path.join(theme.dirname, theme.css);

        theme.watcher = new FileWatcher(themeCss, this.reload, theme.id);

        console.log(`Loading theme by ID '${theme.id}'`);

        // Creates a new style element for that theme
        const style = document.createElement("style");
        style.id = `reGl-theme-${theme.id}`;
        style.classList.add("ReGuilded-Theme");

        // Sets the innerText of the style element to the themeCss file.
        style.innerHTML = readFileSync(themeCss).toString();

        // Adds style element to head element
        document.head.appendChild(style);
    }

    /**
     * Unloads a ReGuilded theme.
     * @param {String} theme ID of the theme to unload from Guilded.
     */
    unload(theme) {
        console.log(`Unloading theme by ID '${theme}'`);
        // Selects the theme's link element by name that is in head element
        const linkRef = document.querySelector(`head style#reGl-theme-${theme}`);
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
        const themeCss = path.join(theme.dirname, theme.css);

        // Gets the Style within Guilded.
        const style = document.getElementById(`reGl-theme-${theme.id}`);

        // Sets the innerText of the style element to the themeCss file.
        style.innerHTML = readFileSync(themeCss).toString();
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
 * A Regex pattern for determining whether given theme's ID is correct.
 */
module.exports.idRegex = /^[A-Za-z0-9]+$/g;
