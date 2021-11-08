const ExtensionManager = require("./extension.js");
const { existsSync, readFile } = require("fs");
const _module = require("module");
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
    }

    /**
     * Initiates themes for ReGuilded and theme manager.
     * @param {String[]} enabled An array of enabled themes.
     */
    init(enabled = []) {
        console.log("Initiating theme manager");

        // Make sure <sgroup> elements are ignored
        const reGuildedGroup = document.createElement("sgroup");
        reGuildedGroup.id = "reGl-main";
        const reGuildedStyle = document.createElement("style");
        reGuildedStyle.innerHTML = "sgroup{display:none;}";

        reGuildedGroup.appendChild(reGuildedStyle)
        document.head.appendChild(reGuildedGroup)


        // Initialize these here instead of getDirs()
        this.all = [];
        this.enabled = enabled;

        this.watch((_, loaded, metadata) => new Promise((resolve, reject) => {
            // If the theme is already loaded, unload it
            loaded && this.unload(metadata);
            // If the theme is in the list of all themes, remove it
            ~this.all.indexOf(metadata) && this.all.splice(this.all.indexOf(metadata, 1));


            const propFiles = typeof metadata.files === "string" ? [metadata.files] : metadata.files;
            metadata.files = propFiles;

            // Since we turned string into single-item array,
            // we don't need to check for both types
            if (!Array.isArray(propFiles))
                return reject(new TypeError(`Expected property 'files' to be either a string or an array. In path: ${metadataPath}`));

            for (let file of propFiles) {
                const filePath = getCssPath(metadata, file);

                if (!existsSync(filePath))
                    return reject(new Error(`Could not find CSS file in path ${filePath}`));
            }


            if (this.enabled.includes(metadata.id))
                // Load the theme and add it to loaded dictionary
                this.load(metadata);

            this.all.push(metadata);

            resolve(metadata);
        }));
    }

    /**
     * Loads a ReGuilded theme
     * @param {{id: String, name: String, dirname: String, files: String[]}} metadata ReGuilded theme to load
     */
    load(metadata) {
        console.log(`Loading theme by ID '${metadata.id}'`);

        // Creates a new style group element for that theme
        const group = document.createElement("sgroup");
        group.id = `reGl-theme-${metadata.id}`;
        group.classList.add("reGl-theme");

        // Add all CSS files to the group
        for (let file of metadata.files)
            readFile(getCssPath(metadata, file), { encoding: 'utf8' }, (e, d) => {
                if (e) throw e;

                const style = document.createElement("style");
                style.classList.value = "reGl-css reGl-css-theme";
                style.innerHTML = d;

                group.appendChild(style);
            });

        document.body.appendChild(group);
    }

    /**
     * Unloads a ReGuilded theme.
     * @param {{id: String, name: String, dirname: String, files: String[]}} metadata ID of the theme to unload from Guilded.
     */
    unload(metadata) {
        console.log(`Unloading theme by ID '${metadata.id}'`);

        document
            .querySelector(`body sgroup#reGl-theme-${metadata.id}`)
            .remove();

        // Remove the theme files from the cache.
        for (let file of metadata.files) {
            const filePath = getCssPath(metadata, file);

            delete require.cache[filePath];
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
