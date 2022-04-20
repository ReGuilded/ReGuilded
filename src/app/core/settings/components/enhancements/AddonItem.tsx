import { EnhancementGridItemProps } from "./EnhancementGrid";
import { Addon } from "../../../../../common/enhancements";
import EnhancementItem from "./EnhancementItem";
import { MenuSectionSpecs } from "../../../../guilded/menu";

const React = window.ReGuilded.getApiProperty("react"),
    { default: IconAndLabel } = window.ReGuilded.getApiProperty("guilded/components/IconAndLabel");

export default class AddonItem extends React.Component<EnhancementGridItemProps<Addon>> {
    private _overflowMainSection: MenuSectionSpecs;

    constructor(props, context) {
        super(props, context);

        this.state = {
            enabled: window.ReGuilded.addons.enabled.includes(props.id)
        };

        const { switchTab } = this.props;

        this._overflowMainSection = {
            name: "Addon",
            header: "Addon",
            actions: [
                {
                    label: "Permissions",
                    icon: "icon-filter",
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
        const { props, props: { enhancement: { _error } } } = this;

        return (
            <EnhancementItem {...props} overflowMenuSection={this._overflowMainSection}>
                {/* Additional info in the footer */}
                { typeof _error != "undefined" && <IconAndLabel className="ReGuildedEnhancement-info-point ReGuildedEnhancement-error-point" iconName="icon-failed-send" label="An error occurred" labelClassName="GuildedText-container-color-errorRed" /> }
            </EnhancementItem>
        );
    }
}