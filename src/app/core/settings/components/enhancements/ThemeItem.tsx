import { EnhancementGridItemProps } from "./EnhancementGrid";
import { MenuSectionSpecs } from "../../../../guilded/menu";
import { Theme } from "../../../../../common/enhancements";
import { FieldAnySpecs } from "../../../../guilded/form";
import EnhancementItem from "./EnhancementItem";
import validations from "../../validation";

const React = window.ReGuilded.getApiProperty("react");

export default class ThemeItem extends React.Component<EnhancementGridItemProps<Theme>> {
    private _overflowMainSection?: MenuSectionSpecs;

    constructor(props, context) {
        super(props, context);

        const { enhancement: { settings } } = this.props;

        const { switchTab } = this.props;

        // Add "Settings" button if settings are present
        if (settings)
            this._overflowMainSection = {
                name: "Theme",
                header: "Theme",
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
            };
    }
    render() {
        const {
            props,
            _overflowMainSection
        } = this;

        return (
            <EnhancementItem {...props} overflowMenuSection={_overflowMainSection} />
        )
    }
}