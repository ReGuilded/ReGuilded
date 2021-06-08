/**
 * Manager that manages ReGuilded's themes
 */
module.exports = class ThemesManager {
    constructor() {
        this.themes = []
        this.enabledThemes = [] 
        this.themesDir = global._Settings.getThemesDir();
    }

    /**
     * Initiates theme manager
     */
    init() {
        // TODO: Create a list of themes, correct a list of themes
    }

    // TODO: Complete Theme Loading/Unloading.

    /**
     * Loads ReGuilded themes onto Guilded.
     */
    loadThemes() {
        console.log("Loading Reguilded themes...");
        // Loads all found enabled themes
        for(let theme of this.enabledThemes)
            // Loads enabled theme
            this.loadTheme(theme)
    }
    /**
     * Loads ReGuilded theme
     * @param {{id: String, name: String, path: String}} theme ReGuilded theme to load
     */
    loadTheme(theme) {
        console.log(`Loading theme '${theme.name}'`)
        // Creates a new link element for that theme
        const link = document.createElement("link")
        // Sets attributes for the link element
        link.id = `reGuilded--${theme.id}`
        link.rel = "stylesheet"
        link.href = theme.path
        // Adds link element to head element
        document.head.appendChild(link)
    }
    
    /**
     * Removes ReGuilded themes from Guilded.
     */
    unloadThemes() {
        console.log("Unloading ReGuilded themes...");
        // Gets all enabled themes
        for(let theme of this.enabledThemes)
            // Unloads a theme
            this.unloadTheme(theme)
    }
    /**
     * Unloads a ReGuilded theme.
     * @param {{id: String, name: String, path: String}} theme Theme to unload from Guilded.
     */
    unloadTheme(theme) {
        console.log(`Unloading theme '${theme.name}'`)
        // Selects the theme's link element by name that is in head element
        const linkRef = document.querySelector(`head link#reGuilded--${theme.id}`)
        // Removes it
        linkRef.remove()
    }
};