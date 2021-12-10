import { writeFileSync } from "fs";
import { join } from "path";

import validations from "../validation";
import ExtensionItem from "./ExtensionItem";

const { OverlayProvider } = window.ReGuildedApi;

@OverlayProvider(["SimpleFormOverlay"])
export default class ThemeItem extends ExtensionItem<object> {
    constructor(props, context) {
        super(props, context);

        this.props.type = "theme";

        const { id, settings, settingsProps, dirname } = props;

        this.state = {
            dirname,
            settings,
            settingsProps,
            enabled: ~window.ReGuilded.themesManager.enabled.indexOf(id)
        };

        // Move this somewhere else
        const settingsBtnCallback = this.openThemeSettings.bind(this);

        // Add "Settings" button if settings are present
        if (settings)
            this.overflowMenuSpecs.sections.push({
                name: "Theme",
                type: "rows",
                actions: [
                    {
                        label: "Settings",
                        icon: "icon-settings",
                        onClick: settingsBtnCallback
                    }
                ]
            });
    }
    get formSpecs() {
        const { settings, settingsProps } = this.state;

        return {
            sections: [
                {
                    fieldSpecs: settingsProps.map(id => {
                        const { type, value, name } = settings[id];

                        // Get validation function and type that fit
                        const validationFunction = validations[type];

                        return {
                            type: "Text",
                            fieldName: id,
                            header: name,
                            label: type ? `Value (${type})` : "Value",
                            defaultValue: value,

                            inputType: type === "number" ? type : undefined,
                            validationFunction,

                            grow: 1
                        }
                    })
                }
            ]
        }
    }
    /**
     * Changes theme's enabled state.
     * @param enabled The state of the switch
     */
    override onToggle(enabled: boolean) {
        const config = window.ReGuilded.settingsManager.config.themes,
              themes = window.ReGuilded.themesManager,
              { id } = this.props;

        // The new state is true, enable the theme and add it to the config
        if (enabled) {
            window.ReGuilded.themesManager.load(this.props);
            config.enabled = [...config.enabled, id];
        } else { // The state is false, disable the theme and remove it from the config
            window.ReGuilded.themesManager.unload(this.props);
            config.enabled = config.enabled.filter(_id => _id !== id);
        }

        // Spaghetti
        themes.enabled = config.enabled;

        // REVIEW: Is this still needed?
        // Re-init all theme data
        // ThemeSettingsHandler.reInitAll();

        // Write the new date
        writeFileSync(
            join(window.ReGuilded.settingsManager.directory, "settings.json"),
            JSON.stringify(window.ReGuilded.settingsManager.config, null, "\t")
        );

        this.setState({ enabled });
    }
    async openThemeSettings() {
        const { name } = this.props;

        // Get whether Save was clicked and get form values
        const { confirmed, changedValues } =
            await this.SimpleFormOverlay.Open({
                header: name + " settings",

                confirmText: "Save",
                controlConfiguration: "ConfirmAndCancel",

                formSpecs: this.formSpecs
            });

        // FIXME: .overrides is always {}. Might as well replace ThemeSettingsHandler entirely
        if (confirmed)
            window.ReGuilded.themesManager.assignProperties(this.props, changedValues);
    }
}