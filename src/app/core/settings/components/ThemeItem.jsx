import { readFileSync, writeFileSync } from "fs";
import ExtensionItem from "./ExtensionItem.jsx";
import { join } from "path";

import { ThemeSettingsHandler } from "../index.jsx";
import { validateColor } from '../validation.ts';
import ExtensionItem from "./ExtensionItem.jsx";

const { React, OverlayProvider } = ReGuildedApi;

export default OverlayProvider(["SimpleFormOverlay"])(class ThemeItem extends ExtensionItem {
    constructor(props, context) {
        super(props, context);

        this.props.type = "theme";

        const { id, dirname, files: fileList } = props;

        const file = fileList[0];
        const fp = join(dirname, file);
        const data = readFileSync(fp, "utf8");

        this.state = {
            fp,
            data,
            dirname,

            /** @type {[line: string, propName: string, propValue: string]} */
            variables: [...data.matchAll(/--(\S+?):(?:\s*)?(\S*?);/g)],
            /** @type {boolean} */
            enabled: ~ReGuilded.themesManager.enabled.indexOf(id)
        };

        // Move this somewhere else
        const settingsBtnCallback = this.openThemeSettings.bind(this);

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
        const { variables } = this.state;

        return {
            sections: [
                {
                    fieldSpecs: variables.map(([, name, defaultValue]) => {
                        // Get validation function and type that fit
                        const [ validationFunction, type ] =

                            !validateColor(defaultValue) ? [validateColor, "color"]
                            : [];

                        return {
                            type: "Text",
                            fieldName: name,
                            header: ThemeItem.formatCssVarName(name),
                            label: type ? `Value (${type})` : "Value",
                            defaultValue,
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
        }
        // The state is false, disable the theme and remove it from the config
        else {
            ReGuilded.themesManager.unload(this.props);
            config.enabled = config.enabled.filter(_id => _id !== id);
        }

        // Spaghetti
        themes.enabled = config.enabled;

        // Re-init all theme data
        ThemeSettingsHandler.reInitAll();

        // Write the new date
        writeFileSync(
            join(ReGuilded.settingsManager.directory, "settings.json"),
            JSON.stringify(ReGuilded.settingsManager.config, null, "\t")
        );

        this.setState({ enabled });
    }
    async openThemeSettings() {
        const { id, name } = this.props;

        // Get whether Save was clicked and get form values
        const { confirmed, values } =
            await this.SimpleFormOverlay.Open({
                header: name + " settings",

                confirmText: "Save",
                controlConfiguration: "ConfirmAndCancel",

                formSpecs: this.formSpecs
            });

        // FIXME: .overrides is always {}. Might as well replace ThemeSettingsHandler entirely
        if (confirmed)
            ThemeSettingsHandler.overrides[id].setAll(values);
    }

    /**
     * Changes `snake-case` to `Capitalized Case`.
     * @param {string} name The name of the CSS variable.
     * @example "--fizz-buzz" => "Fizz Buzz"
     * @returns {string} Formatted CSS variable
     */
    static formatCssVarName(name) {
        return name
            .split("-")
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
    }
});