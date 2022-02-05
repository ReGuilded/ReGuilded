import { Theme } from "../../../../../common/extensions";
import ExtensionView from "./ExtensionView";
import ThemeItem from "./ThemeItem";

const React = window.ReGuilded.getApiProperty("react"),
    { default: Form } = window.ReGuilded.getApiProperty("guilded/components/Form");

export default class ThemeView extends ExtensionView<Theme> {
    protected type = "theme";
    protected extensionHandler = window.ReGuilded.themes;
    private _SaveBinded: () => Promise<void>;

    constructor(props, context?) {
        super(props, context);

        props.extension.settings && this.tabs.push({ name: "Settings" });
        this._SaveBinded = this._handleSaveChangesClick.bind(this);
    }

    protected override *onSaveChanges({ values, isValid }) {
        if (isValid)
            // Change this if colour fields will be used
            this.extensionHandler.assignProperties(this.props.extension, values);
    }
    protected override renderTabs(theme: Theme) {
        return (
            theme.settings &&
            <div className="ReGuildedExtensionPage-tab">
                {/* TODO: Settings saving */}
                <Form onChange={this._handleOptionsChange} formSpecs={{
                    header: "Settings",
                    sectionStyle: "border-unpadded",
                    sections: [
                        {
                            fieldSpecs: ThemeItem.generateSettingsFields(theme.settings, theme.settingsProps)
                        },
                        {
                            fieldSpecs: [
                                {
                                    type: "Button",

                                    buttonText: "Save",

                                    onClick: this._SaveBinded
                                }
                            ]
                        }
                    ]
                }}/>
            </div>
        );
    }
}