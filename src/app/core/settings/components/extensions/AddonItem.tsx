import { ProvidedOverlay } from "../../../../guilded/decorators";
import { Addon } from "../../../../../common/extensions";
import ExtensionItem from "./ExtensionItem";

export default class AddonItem extends ExtensionItem<Addon, { fp: string }> {
    SimpleFormOverlay: ProvidedOverlay<"SimpleFormOverlay">;

    constructor(props, context) {
        super(props, context);

        this.state = {
            dirname: props.dirname,
            fp: props.dirname,
            enabled: window.ReGuilded.addons.enabled.includes(props.id)
        };

        const { switchTab } = this.props;

        this.overflowMenuSpecs.sections.push({
            name: "Addon",
            type: "rows",
            actions: [
                {
                    label: "Permissions",
                    icon: "icon-filter",
                    onClick: () => switchTab("specific", { extension: this.props, defaultTabIndex: 1 }),
                }
            ]
        });
    }
    protected override async onToggle(enabled: boolean): Promise<void> {
        await window.ReGuilded.addons[enabled ? "savedLoad" : "savedUnload"](this.props)
            .then(() => this.setState({ enabled }));
    }
}