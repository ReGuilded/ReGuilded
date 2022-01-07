import { Theme } from "../../../../../common/extensions";
import ExtensionView from "./ExtensionView";
import ThemeItem from "./ThemeItem";

const { React, Form, WordDividerLine } = window.ReGuildedApi;

export default class ThemeView extends ExtensionView<Theme> {
    protected type = "theme";
    protected extensionManager = window.ReGuilded.themes;
    constructor(props, context?) {
        super(props, context);
    }
    override renderContent(theme: Theme) {
        return (
            //theme.settings &&
            <div className="ReGuildedExtensionPage-configuration">
                {/* <WordDividerLine word="Configuration" wordStyle="chat" />
                <Form formSpecs={{
                    header: "Settings",
                    sections: [
                        {
                            fieldSpecs: ThemeItem.generateSettingsFields(theme.settings, theme.settingsProps)
                        },
                        {
                            fieldSpecs: [
                                {
                                    type: "Button",
                                    buttonText: "Save",
                                    onClick(...e) {
                                        console.log('E', e)
                                    }
                                }
                            ]
                        }
                    ]
                }}/> */}
            </div>
        );
    }
}