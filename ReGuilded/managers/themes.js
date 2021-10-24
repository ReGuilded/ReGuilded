const ExtensionManager = require("./extension.js");
const { existsSync, readFile } = require("fs");
const chokidar = require("../libs/chokidar");
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

        // Create a loaded dictionary, to replace the old index-based load checker,
        // along with unloading when hot reloading
        const loaded = {};
        // Create a de-bouncer dictionary, to prevent lag from multi-loading
        const deBouncers = {};
        // Watch the directory for any file changes
        chokidar.watch(this.dirname).on("all", (type, fp) => {
            const dir = path.basename(path.dirname(fp));
            // Initialize the de-bouncer
            clearTimeout(deBouncers[dir]);
            deBouncers[dir] = setTimeout(() => {
                const themePath = super.getPath(dir);

                // Get the metadata.json file path, and if it doesn't exist, ignore it
                const metadataPath = path.join(themePath, "metadata.json");
                if (!existsSync(metadataPath)) {
                    this.all.find(metadata => metadata.dirname === themePath) !== undefined && this.all.splice(this.all.index(this.all.find(metadata => metadata.dirname === themePath)), 1);
                    return;
                }

                // Require the metadata file.
                const metadata = require(metadataPath);
                metadata.dirname = themePath;

                // If the theme is already loaded, unload it
                loaded[dir] && this.unload(metadata);
                // If the theme is in the list of all themes, remove it
                ~this.all.indexOf(metadata) && this.all.splice(this.all.indexOf(metadata, 1));

                const propFiles = typeof metadata.files === "string" ? [metadata.files] : metadata.files;
                metadata.files = propFiles;

                // Since we turned string into single-item array,
                // we don't need to check for both types
                if (!Array.isArray(propFiles))
                    throw new TypeError(`Expected property 'files' to be either a string or an array. In path: ${metadataPath}`);

                for (let file of propFiles) {
                    const filePath = getCssPath(metadata, file);

                    if (!existsSync(filePath))
                        throw new Error(`Could not find CSS file in path ${filePath}`);

                    this.all.push(metadata)

                    if (this.enabled.includes(metadata.id)) {
                        // Load the theme.
                        this.load(metadata);

                        loaded[dir] = metadata;

                        // I... don't want to talk about this
                        this.checkLoaded(Object.keys(loaded).filter(dir => ~enabled.indexOf(dir)).length - 1, enabled.length);
                    }
                }
            }, 250);
        });
    }

    /**
     * Loads a ReGuilded theme
     * @param {{id: String, name: String, dirname: String, files: String[]}} metadata ReGuilded theme to load
     */
    load(metadata) {
        console.log(`Loading theme by ID '${metadata.id}'`);

        // Creates a new style element for that theme
        const group = document.createElement("sgroup");
        group.id = `reGl-theme-${metadata.id}`;
        group.classList.add("reGl-theme");

        for (let file of metadata.files) {
            const filePath = getCssPath(metadata, file);

            const theme = require(filePath);

            if (theme.source) {
                const style = document.createElement("style");
                style.classList.value = "reGl-css reGl-css-theme";
                style.innerHTML = theme.source;

                group.appendChild(style)
            }
        }

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
