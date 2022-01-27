import { Addon } from "../../../../../common/extensions";
import ExtensionView from "./ExtensionView";

const {
    react: React,
    // "guilded/components/Form": { default: Form }
} = window.ReGuildedApi;

export default class AddonView extends ExtensionView<Addon> {
    protected type = "addon";
    protected extensionHandler = window.ReGuilded.addons;

    constructor(props, context?) {
        super(props, context);
    }
    protected override renderTabs(addon: Addon) {
        return (
            <div className="ReGuildedExtensionPage-tab">
            </div>
        );
    }
}