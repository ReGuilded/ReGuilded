import { patchElementRenderer } from "../../addons/lib";
import AddonSettings from "./components/extensions/AddonSettings";
import ThemeSettings from "./components/extensions/ThemeSettings";
import patcher from "../../addons/patcher";
import TabbedSettings from "./components/TabbedSettings";
import GeneralSettings from "./components/GeneralSettings";
import AddonView from "./components/extensions/AddonView";
import ThemeView from "./components/extensions/ThemeView";

export default class SettingsInjector {
    id = "SettingsInjector";

    async init() {
        // Patch the settings renderer
        await patchElementRenderer(".SettingsMenu-container", this.id, "before", this.renderSettings.bind(this))
            // Then run this awful nightmare, since forceUpdate doesn't work
            .then(this.forceUpdateOverlay)
            // If an oopsies happens, notify us
            .catch(e => console.error("Settings injector: Failed to patch the settings renderer!", e));
    }

    // This gets the sub-category buttons, then clicks the second and back to the first
    // This only happens on the first entry, and it's to force the ReGuilded category to render
    forceUpdateOverlay() {
        const buttons: HTMLCollectionOf<HTMLButtonElement> = document.getElementsByClassName("PersistentActionMenuItem-container") as HTMLCollectionOf<HTMLButtonElement>;

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
                {
                    id: "rgGeneral",
                    label: "General",
                    Component: GeneralSettings
                },
                {
                    id: "rgAddons",
                    label: "Add-ons",
                    Component: TabbedSettings,
                    hasNestedOptionsMenuPage: true,
                    props: {
                        tabs: {
                            list: AddonSettings,
                            specific: AddonView
                        },
                        defaultTab: "list"
                    }
                },
                {
                    id: "rgThemes",
                    label: "Themes",
                    Component: TabbedSettings,
                    hasNestedOptionsMenuPage: true,
                    props: {
                        tabs: {
                            list: ThemeSettings,
                            specific: ThemeView
                        },
                        defaultTab: "list"
                    }
                },
                // {
                //     id: "rgAddon-extension",
                //     label: "Extension Name",
                //     Component: ThemeSettings,
                //     calloutBadgeProps: {
                //         text: "Addon",
                //         style: {
                //             backgroundColor: "#CC5555"
                //         }
                //     }
                // }
            ]
        });
    }

    // Cleanup time, even though this probably never gets called, considering it's the settings
    uninit() {
        patcher.unpatchAll(this.id);
    }
}