import { FieldAnySpecs } from "../../../../guilded/form";
import { Theme } from "../../../../../common/enhancements";
import EnhancementItem from "./EnhancementItem";
import validations from "../../validation";

export default class ThemeItem extends EnhancementItem<Theme, { settings: object, settingsProps: string[] }> {
    constructor(props, context) {
        super(props, context);

        const { enhancement: { settings } } = this.props;

        const { switchTab } = this.props;

        // Add "Settings" button if settings are present
        if (settings)
            this.overflowMenuSpecs.sections.unshift({
                name: "Theme",
                header: "Theme",
                type: "rows",
                actions: [
                    {
                        label: "Settings",
                        icon: "icon-settings",
                        onClick: () => switchTab("specific", {
                            enhancement: this.props.enhancement,
                            defaultTabIndex: 1,
                            className: "ReGuildedSettingsWrapper-container ReGuildedSettingsWrapper-container-no-padding ReGuildedSettingsWrapper-container-cover"
                        })
                    }
                ]
            });
    }
    get formSpecs() {
        const { settings, settingsProps } = this.props.enhancement;

        return {
            sections: [
                {
                    fieldSpecs: ThemeItem.generateSettingsFields(settings, settingsProps)
                }
            ]
        }
    }
    static generateSettingsFields(settings: object, settingsProps: string[]): FieldAnySpecs[] {
        return settingsProps.map(id => {
            const { type, value, name } = settings[id];

            return {
                type: "Text",
                fieldName: id,
                header: name,
                label: type ? `Value (${type})` : "Value",
                defaultValue: value,

                inputType: type === "number" ? type : undefined,
                validationFunction: validations[type],

                grow: 1
            };
        });
    }
}