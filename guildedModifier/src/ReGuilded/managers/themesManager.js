const fs = require("fs")
const path = require("path")

/**
 * Manager that manages ReGuilded's themes
 */
module.exports = class ThemesManager {
    /**
     * Manager that manages ReGuilded's themes
     * @param {String} themesDir The directory of the ReGuilded themes
     */
    constructor(themesDir) {
        this.themesDir = themesDir;
    }

    /**
     * Checks if the identifier of the theme is correct or not.
     * @param {String} id The identifier of a theme
     * @returns Whether the identifier is correct or not
     */
    static checkThemeId(id) {
        return id
            // Removes correct parts of the ID
            .replaceAll(module.exports.idRegex, "")
            // Checks if it's empty
            .length === 0
    }

    /**
     * Initiates theme manager
     */
    init(enabled = []) {
        // Create themes array
        this.themes = []
        // Sets enabled themes
        this.enabled = enabled
        // Gets all files in theme directory
        const themes = fs
            .readdirSync(this.themesDir, { withFileTypes: true })
            .filter(x => x.isDirectory())

        // Gets every theme directory
        for(let theme of themes) {
            // Creates path to the Theme Directory
            const themePath = path.join(this.themesDir, theme.name);

            // Creates path of theme.json
            const jsonPath = path.join(themePath, "theme.json")
            // If json doesn't exist, ignore this directory
            if(!fs.existsSync(jsonPath)) continue
            // Get that json
            const json = require(jsonPath)

            // Gets ID property
            const propId = json.id
            // Checks if it's a string
            if(typeof propId !== "string") throw new TypeError(`Expected 'id' to be string, found ${typeof propId} instead in ${jsonPath}`)

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
            this.themes.push(json)
        }

        // Wait 3 seconds to let Guilded's Styles load.
        setTimeout(function() {
            this.loadThemes();
        }.bind(this), 3000)

    }

    /**
     * Loads ReGuilded themes onto Guilded.
     */
    loadThemes() {
        console.log("Loading Reguilded themes...");

        // Loads all found enabled themes
        for (let theme of this.themes) {
            if (this.enabled.includes(theme.id) != null) {
                this.loadTheme(theme);
            }
        }
    }

    /**
     * Loads ReGuilded theme
     * @param {{id: String, name: String, css: String}} theme ReGuilded theme to load
     */
    loadTheme(theme) {
        // Creates path to the Theme Directory
        const themePath = path.join(this.themesDir, theme.name);
        const themeCss = path.join(themePath, theme.css);

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
     * Removes ReGuilded themes from Guilded.
     */
    unloadThemes() {
        console.log("Unloading ReGuilded themes...");
        // Gets all enabled themes
        for(let id of this.enabled)
            // Unloads a theme
            this.unloadTheme(id)
    }
    /**
     * Unloads a ReGuilded theme.
     * @param {String} theme ID of the theme to unload from Guilded.
     */S
    unloadTheme(theme) {
        console.log(`Unloading theme by ID '${theme}'`)
        // Selects the theme's link element by name that is in head element
        const linkRef = document.querySelector(`head link#reGl-theme-${theme}`)
        // Removes it
        linkRef.remove()
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