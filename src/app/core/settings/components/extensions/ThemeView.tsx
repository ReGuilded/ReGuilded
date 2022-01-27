import { Theme } from "../../../../../common/extensions";
import ExtensionView from "./ExtensionView";
import ThemeItem from "./ThemeItem";

const {
    react: React,
    "guilded/components/Form": { default: Form }
} = window.ReGuildedApi;

export default class ThemeView extends ExtensionView<Theme> {
    protected type = "theme";
    protected extensionHandler = window.ReGuilded.themes;

    constructor(props, context?) {
        super(props, context);

        props.extension.settings && this.tabs.push({ name: "Settings" });
    }

    protected override renderTabs(theme: Theme) {
        return (
            theme.settings &&
            <div className="ReGuildedExtensionPage-tab">
                {/* TODO: Settings saving */}
                <Form formSpecs={{
                    header: "Settings",
                    sectionStyle: "border-unpadded",
                    sections: [
                        {
                            fieldSpecs: ThemeItem.generateSettingsFields(theme.settings, theme.settingsProps)
                        }
                    ]
                }}/>
            </div>
        );
    }
}