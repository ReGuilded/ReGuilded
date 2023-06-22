import { Theme } from "../../../../../common/enhancements";
import ErrorBoundary from "../ErrorBoundary";
import EnhancementView from "./EnhancementView";
import ThemeItem from "./ThemeItem";

const React = window.ReGuilded.getApiProperty("react"),
    { default: Form } = window.ReGuilded.getApiProperty("guilded/components/Form");

export default class ThemeView extends EnhancementView<Theme> {
    protected type = "theme";
    protected enhancementHandler = window.ReGuilded.themes;
    private _SaveBinded: () => Promise<void>;

    constructor(props, context?) {
        super(props, context);

        props.enhancement.settings && this.tabs.push({ name: "Settings" });

        this._SaveBinded = this.Save?.bind(this);
    }

    protected override *onSaveChanges({ values, isValid }) {
        if (isValid)
            // Change this if colour fields will be used
            this.enhancementHandler.assignProperties(this.props.enhancement, values);
    }
    protected override renderTabs(theme: Theme) {
        return (
            theme.settings &&
            <div className="ReGuildedEnhancementPage-tab">
                <ErrorBoundary>
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
                </ErrorBoundary>
            </div>
        );
    }
}