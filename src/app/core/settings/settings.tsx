import AddonSettings from "./components/enhancements/AddonSettings";
import ThemeSettings from "./components/enhancements/ThemeSettings";
import GeneralSettings from "./components/GeneralSettings";
import AddonPage from "./components/enhancements/AddonPage";
import ThemePage from "./components/enhancements/ThemePage";
import PagedSettings from "./components/PagedSettings";
import { patchElementRenderer } from "../../addons/lib";
import patcher from "../../addons/patcher";
import Changelog from "./components/Changelog";
import AddonApi from "../../addons/addonApi";

export default class SettingsInjector {
    id = "SettingsInjector";

    async init() {
        // Patch the settings renderer
        await patchElementRenderer(".SettingsMenu-container", this.id, "before", this.renderSettings.bind(this))
            // Then run this awful nightmare, since forceUpdate doesn't work
            .then(this.forceUpdateOverlay)
            // If an oopsies happens, notify us
            .catch((e) => console.error("Settings injector: Failed to patch the settings renderer!", e));
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
        // If our category already exists, nothing to do here
        if (props.settingsOptions.sections.some((sect) => sect.id == "reguilded")) return;

        // If the app settings categories isn't in the sections, return
        // This is to prevent from rendering on server settings and other settings
        if (props.settingsOptions.sections.some((sect) => sect.name == "App settings")) {
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
                        label: "Addons",
                        Component: PagedSettings,
                        hasNestedOptionsMenuPage: true,
                        props: {
                            tabs: {
                                list: AddonSettings,
                                specific: AddonPage
                            },
                            defaultTab: "list"
                        }
                    },
                    {
                        id: "rgThemes",
                        label: "Themes",
                        Component: PagedSettings,
                        hasNestedOptionsMenuPage: true,
                        props: {
                            tabs: {
                                list: ThemeSettings,
                                specific: ThemePage
                            },
                            defaultTab: "list"
                        }
                    },
                    {
                        id: "rgChangelog",
                        label: "Changelog",
                        Component: Changelog,
                        calloutBadgeProps: window.ReGuilded.stateHandler.config.lastViewedChangelogVersion != window.ReGuilded.version && {
                            text: "New",
                            style: {
                                backgroundColor: "#FF3232",
                                className: "ReGuildedSettings-badge ReGuildedSettings-badge-new"
                            }
                        }
                    }
                ]
            });
            const allAddonSettings = AddonApi.registries.userSettings.allItems;

            // To not add empty category
            if (allAddonSettings.length)
                props.settingsOptions.sections.push({
                    id: "reguilded-us-addons",
                    name: "ReGuilded Addons",
                    actions: allAddonSettings
                });
        } else if (props.settingsOptions.sections[0].name == "Server settings") {
            const allAddonSettings = AddonApi.registries.serverSettings.allItems;

            // To not add empty category
            if (allAddonSettings.length)
                props.settingsOptions.sections.push({
                    id: "reguilded-ts-addons",
                    name: "ReGuilded Addons",
                    actions: allAddonSettings
                });
        }
    }

    // Cleanup time, even though this probably never gets called, considering it's the settings
    uninit() {
        patcher.unpatchAll(this.id);
    }
}
