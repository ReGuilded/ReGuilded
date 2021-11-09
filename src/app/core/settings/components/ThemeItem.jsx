import { readFileSync, writeFileSync } from "fs";
import ExtensionItem from "./ExtensionItem.jsx";
import { join } from "path";

import { ThemeSettingsHandler } from "../index.jsx";
import validations from '../validation.ts';
import ExtensionItem from "./ExtensionItem.jsx";

const { React, OverlayProvider } = ReGuildedApi;

export default OverlayProvider(["SimpleFormOverlay"])(class ThemeItem extends ExtensionItem {
    constructor(props, context) {
        super(props, context);

        this.props.type = "theme";

        const { id, settings, settingsProps } = props;

        console.log('Theme', props, 'Settings', settings, 'Props', settingsProps)
        this.state = {
            settings,
            settingsProps,
            /** @type {boolean} */
            enabled: ~ReGuilded.themesManager.enabled.indexOf(id)
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
     * @param {boolean} enabled The state of the switch
     */
    onToggle(enabled) {
        const config = ReGuilded.settingsManager.config.themes,
              themes = ReGuilded.themesManager,
              { id } = this.props;

        // The new state is true, enable the theme and add it to the config
        if (enabled) {
            ReGuilded.themesManager.load(this.props);
            config.enabled = [...config.enabled, id];
        } else { // The state is false, disable the theme and remove it from the config
            ReGuilded.themesManager.unload(this.props);
            config.enabled = config.enabled.filter(_id => _id !== id);
        }

        // Spaghetti
        themes.enabled = config.enabled;

        // REVIEW: Is this still needed?
        // Re-init all theme data
        // ThemeSettingsHandler.reInitAll();

        // Write the new date
        writeFileSync(
            join(ReGuilded.settingsManager.directory, "settings.json"),
            JSON.stringify(ReGuilded.settingsManager.config, null, "\t")
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
            ReGuilded.themesManager.assignProperties(this.props, changedValues);
    }
});