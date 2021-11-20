import { patchElementRenderer } from '../../addons/lib.jsx';
import AddonSettings from "./components/AddonSettings.jsx";
import ThemeSettings from "./components/ThemeSettings.jsx";
import patcher from "../../addons/patcher";

const path = require("path");
const fs = require("fs");

// export const ThemeSettingsHandler = new class {
//     overrides = {};
//     container;
//     initialized = false;

//     init() {
//         // Ensure we haven't already initialized
//         if (this.initialized) return;

//         if (ReGuilded.themesManager.allLoaded)
//             this.initOnLoad();
//         else
//             ReGuilded.themesManager.on("fullLoad", this.initOnLoad.bind(this))
//     }
//     async initOnLoad() {
//         this.container = Object.assign(document.createElement("style"), {
//             id: "ReGuildedThemeSettingsOverride"
//         });
        
//         //this.reInitAll();
//         document.head.appendChild(this.container);
        
//         // Set the window object, for testing mostly
//         // @ts-ignore
//         ReGuilded.themesManager.overridesHandler = this;

//         this.initialized = true;
//     }

//     // Re-initialize all themes
//     reInitAll() {
//         ReGuilded.themesManager.all.forEach(theme => this.initTheme(theme.id));
//     }

//     // Initialize the theme object
//     initTheme(id) {
//         // Try to find our theme by ID
//         const theme = ReGuilded.themesManager.all.find(t => t.id === id);
//         if (!theme) return;

//         // Try-catch to prevent conflicts
//         try {
//             // Get the path to the overrides.json file in the theme's directory
//             const fp = path.join(theme.dirname, "overrides.json");
//             // Get the raw data. If the file exists, read it, otherwise create an empty object
//             const rawData =
//                 fs.existsSync(fp)
//                     ? fs.readFileSync(fp, "utf8")
//                     : "{}";
//             // Parse the raw data to a JS object
//             const data = JSON.parse(rawData);

//             // Define our themes override object
//             this.overrides[id] = new ThemeOverridesDictionary(id, fp, data);
//         }
//         catch (err) {
//             console.error("Failed to initialize theme overrides!", id, err);
//         }

//         // Since this calls upon init in a for loop, de-bounce so we don't spam the render method
//         this.renderSafely();
//     }

//     // Create a de-bouncer, to prevent rapid rendering
//     safelyRenderDeBouncer;
//     renderSafely() {
//         clearTimeout(this.safelyRenderDeBouncer);
//         this.safelyRenderDeBouncer = setTimeout(this.render.bind(this), 500);
//     }

//     render() {
//         if (this.initialized)
//         {
//             this.container.textContent = `#app {${Object.values(this.overrides)
//                     .filter(({ id }) => ~ReGuilded.themesManager.enabled.indexOf(id))
//                     .map(({ data }) =>
//                     Object.entries(data).map(([propName, propValue]) =>
//                     `--${propName}:${propValue};`).join("")).join("")}}`;
//         }
//     }
// }

// export class ThemeOverridesDictionary {
//     id;
//     fp;
//     data;
//     constructor(id, fp, data) {
//         Object.assign(this, {
//             id, fp,
//             data: data ?? {}
//         });
//     }
//     // Simple return the object or the fallback
//     get(key, fallback) {
//         return this.data[key] ?? fallback;
//     }

//     set(key, value) {
//         this.data[key] = value;

//         // Write and render the new data
//         this.serialize();
//         ThemeSettingsHandler.render();
//     }
//     setAll(obj) {
//         Object.assign(this.data, obj);

//         // Write and render the new data
//         this.serialize();
//         ThemeSettingsHandler.render();
//     }

//     reset(key) {
//         // Delete the override key
//         delete this.data[key];

//         // Write the new data
//         this.serialize();
//         // Render the new data
//         ThemeSettingsHandler.render();
//     }

//     serialize() {
//         // Try-catch, just in case. Should pretty much never trip
//         try {
//             fs.writeFileSync(this.fp,
//                 JSON.stringify(this.data, null, "\t"), {encoding: "utf8"});
//         }
//         catch (err) {
//             console.error("Failed to serialize theme override data!", this.id, err);
//         }
//     }
// }

const SettingsInjector = new class extends BaseAddon {
    id = "SettingsInjector";

    init() {
        // // Initialize overrides
        // ThemeSettingsHandler.init();

        // Patch the settings renderer
        patchElementRenderer(".SettingsMenu-container", this.id, "before", this.renderSettings.bind(this))
            // Then run this awful nightmare, since forceUpdate doesn't work
            .then(this.forceUpdateOverlay)
            // If an oopsies happens, notify us
            .catch(this.handleError.bind(this, "Failed to patch the settings renderer!"));
    }

    // This gets the sub-category buttons, then clicks the second and back to the first
    // This only happens on the first entry, and it's to force the ReGuilded category to render
    forceUpdateOverlay() {
        const buttons = document.getElementsByClassName("PersistentActionMenuItem-container");

        buttons[1].click();
        setImmediate(() => buttons[0].click());
    }
    
    // Inject our settings entries
    renderSettings({ props }) {
        // If the app settings categories isn't in the sections, return
        // This is to prevent from rendering on server settings and other settings
        if (!props.settingsOptions.sections.some(sect => sect.name === "App settings")) return;
        
        // If our category already exists, nothing to do here
        if (props.settingsOptions.sections.some(sect => sect.id === "reguilded")) return;
        
        // Push the sections to the props before they get rendered
        props.settingsOptions.sections.push({
            id: "reguilded",
            name: "ReGuilded",
            actions: [
                // {
                //     id: "rgSettings",
                //     label: "Settings",
                //     Component: ReGuildedSettings
                // },
                {
                    id: "rgAddons",
                    label: "Addons",
                    Component: AddonSettings
                }, {
                    id: "rgThemes",
                    label: "Themes",
                    Component: ThemeSettings
                }
            ]
        });
    }
    
    // Cleanup time, even though this probably never gets called, considering it's the settings
    uninit() {
        patcher.unpatchAll(this.id);
    }
}

SettingsInjector.init();