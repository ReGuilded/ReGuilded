import { writeFileSync } from "fs";
import { join } from "path";
import { Theme } from "../../managers/themes";

import validations from "../validation";
import ExtensionItem from "./ExtensionItem";

const { OverlayProvider } = window.ReGuildedApi;

@OverlayProvider(["SimpleFormOverlay"])
export default class ThemeItem extends ExtensionItem<Theme, { settings: object, settingsProps: string[] }> {
    SimpleFormOverlay;
    constructor(props, context) {
        super(props, context);

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
    override async onToggle(enabled: boolean): Promise<void> {
        const themes = window.ReGuilded.themesManager;

        await themes[enabled ? "savedLoad" : "savedUnload"](this.props)
            .then(() => this.setState({ enabled }));
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

        if (confirmed)
            window.ReGuilded.themesManager.assignProperties(this.props, changedValues);
    }
}