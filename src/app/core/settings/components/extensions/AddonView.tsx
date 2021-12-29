import { Addon } from "../../../managers/addon";
import ExtensionView from "./ExtensionView";

const { React, WordDividerLine, Form } = window.ReGuildedApi;

export default class AddonView extends ExtensionView<Addon> {
    protected type = "add-on";
    protected extensionManager = window.ReGuilded.addonManager;
    constructor(props, context?) {
        super(props, context);
    }
    override renderContent(addon: Addon) {
        return (
            <div className="ReGuildedExtensionPage-configuration">
                <WordDividerLine word="Configuration" />
            </div>
        );
    }
}