import { Addon } from "../../../../../common/extensions";
import ExtensionView from "./ExtensionView";

const { React, WordDividerLine, Form } = window.ReGuildedApi;

export default class AddonView extends ExtensionView<Addon> {
    protected type = "addon";
    protected extensionManager = window.ReGuilded.addons;
    constructor(props, context?) {
        super(props, context);
    }
    override renderContent(addon: Addon) {
        return (
            <div className="ReGuildedExtensionPage-configuration">
                {/* <WordDividerLine word="Configuration" /> */}
            </div>
        );
    }
}