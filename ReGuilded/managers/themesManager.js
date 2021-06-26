const ExtensionManager = require("./extensionManager.js")
const { FileWatcher } = require("../Utils")
const path = require("path")
const fs = require("fs")

/**
 * Manager that manages ReGuilded's themes
 */
module.exports = class ThemesManager extends ExtensionManager {
    /**
     * Manager that manages ReGuilded's themes
     * @param {String} themesDir The directory of the ReGuilded themes
     */
    constructor(themesDir) {
        super(themesDir)
    }

    /**
     * Initiates themes and theme manager
     * @param {String[]} enabled An array of enabled themes
     */
    init(enabled = []) {
        // Gets a list of theme directories
        const themeDevelopers = [];
        const themes = super.getDirs(enabled)

        // Gets every theme directory
        for(let theme of themes) {
            // Creates path to the Theme Directory
            const themePath = super.getPath(theme.name);
            // Creates path of theme.json
            const jsonPath = path.join(themePath, "theme.json")
            // If json doesn't exist, ignore this directory
            if(!fs.existsSync(jsonPath)) continue
            // Get that json
            const json = require(jsonPath)
            // Sets directory's name
            json.dirname = theme.name

            // Check theme developers variable. This is used later on to give theme developers badges.
            switch (typeof json.developers) {
                case "string":
                    themeDevelopers.push(json.developers);
                    break;
                case "object":
                    if (Array.isArray(json.developers)) {
                        themeDevelopers.concat(json.developers);
                    } else {
                        console.log(`Could not set badges on '${json.name}', because 'developers' is an object, but not an array.`)
                    }
                    break;
                default:
                    console.log(`Could not set badges on '${json.name}', because 'developers' is neither a string or object.`)
                    break;
            }

            // Gets ID property
            const propId = json.id
            // Checks if it's a string
            if(typeof propId !== "string") throw new TypeError(`Expected 'id' to be string, found ${typeof propId} instead in ${jsonPath}`)
            // Checks if ID is correct
            if(!ExtensionManager.checkId(propId)) throw new Error(`Incorrect syntax of the property 'id'.`);

            // Gets name of it or id
            const propName = json.name ?? propId
            // Checks if it's a string
            if(typeof propName !== "string") throw new TypeError(`Expected 'name' to be string, found ${typeof propName} instead in ${jsonPath}`)

            // Gets CSS path
            const propCss = json.css
            // Checks if it's a string
            if(typeof propCss !== "string") throw new TypeError(`Expected property 'css' to be string, found ${typeof propCss} instead in ${jsonPath}`)
            // Gets full CSS path
            const cssPath = path.isAbsolute(propCss) ? propCss : path.join(themePath, propCss)
            // Checks if CSS file exists
            if(!fs.existsSync(cssPath)) throw new Error(`Could not find CSS file in path ${cssPath}`)

            // Adds it to themes array instead
            this.all.push(json)
        }

        // Pushes themeDevelopers variable after removing duplicated IDs.
        const noDuplicatedThemeDevelopers = [];

        for (let developer of themeDevelopers) {
            if (!noDuplicatedThemeDevelopers.includes(developer)) 
                noDuplicatedThemeDevelopers.push(developer)
        }
        
        this.themeDevelopers = noDuplicatedThemeDevelopers;

        // Wait 3 seconds to let Guilded's Styles load.
        setTimeout(function() {
            this.loadAll();
        }.bind(this), 3000)

    }

    /**
     * Loads a ReGuilded theme
     * @param {{id: String, name: String, dirname: String, css: String}} theme ReGuilded theme to load
     */
    load(theme) {
        // Creates path to the Theme Directory
        const themePath = super.getPath(theme.dirname);
        const themeCss = path.join(themePath, theme.css);

        new FileWatcher(themeCss, this, theme.id);

        console.log(`Loading theme by ID '${theme.id}'`)

        // Creates a new style element for that theme
        const style = document.createElement("style")
        style.id = `reGl-theme-${theme.id}`
        style.classList.add("ReGuilded-Theme")

        // Sets the innerText of the style element to the themeCss file.
        style.innerHTML = fs.readFileSync(themeCss).toString();

        // Adds style element to head element
        document.head.appendChild(style)
    }

    /**
     * Unloads a ReGuilded theme.
     * @param {String} theme ID of the theme to unload from Guilded.
     */
    unload(theme) {
        console.log(`Unloading theme by ID '${theme}'`)
        // Selects the theme's link element by name that is in head element
        const linkRef = document.querySelector(`head link#reGl-theme-${theme}`)
        // Removes it
        linkRef.remove()
    }

    /**
     * Reloads a ReGuilded theme.
     * @param {String} id The identifier of the theme
     */
    reload(id) {
        console.log(`Reloading theme by ID '${id}`);

        // Gets the Theme, Theme Path, and Theme Css.
        const theme = this.all.find(object => object.id === id);
        const themePath = super.getPath(theme.dirname);
        const themeCss = path.join(themePath, theme.css);

        // Gets the Style within Guilded.
        const style = document.getElementById(`reGl-theme-${theme.id}`);

        // Sets the innerText of the style element to the themeCss file.
        style.innerHTML = fs.readFileSync(themeCss).toString();
    }

    /**
     * Checks if given theme based on ID is loaded.
     * @param {String} id The identifier of the theme
     * @returns Theme is loaded
     */
    isLoaded(id) {
        return this.enabled.includes(id)
    }
}
/**
 * A Regex pattern for determining whether given theme's ID is correct.
 */
module.exports.idRegex = /^[A-Za-z0-9]+$/g