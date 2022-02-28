import { ProvidedOverlay } from "../../../../guilded/decorators";
import { Addon } from "../../../../../common/enhancements";
import EnhancementItem from "./EnhancementItem";

export default class AddonItem extends EnhancementItem<Addon> {
    SimpleFormOverlay: ProvidedOverlay<"SimpleFormOverlay">;

    constructor(props, context) {
        super(props, context);

        this.state = {
            enabled: window.ReGuilded.addons.enabled.includes(props.id)
        };

        const { switchTab } = this.props;

        this.overflowMenuSpecs.sections.unshift({
            name: "Addon",
            header: "Addon",
            type: "rows",
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
        });
    }
}