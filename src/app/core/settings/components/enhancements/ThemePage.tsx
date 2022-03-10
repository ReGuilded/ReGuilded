//#region Imports
import { ReactNode } from "react";
import { Theme } from "../../../../../common/enhancements";
import { TabOption } from "../../../../guilded/components/sections";
import ErrorBoundary from "../ErrorBoundary";
import { PagedSettingsChildProps } from "../PagedSettings";
import EnhancementPage from "./EnhancementPage";
import ThemeItem from "./ThemeItem";

const React = window.ReGuilded.getApiProperty("react"),
    { default: savableSettings } = window.ReGuilded.getApiProperty("guilded/settings/savableSettings"),
    { default: defaultContextProvider } = window.ReGuilded.getApiProperty("guilded/context/defaultContextProvider"),
    { coroutine } = window.ReGuilded.getApiProperty("guilded/util/functions"),
    { default: Form } = window.ReGuilded.getApiProperty("guilded/components/Form");
//#endregion

type Props = PagedSettingsChildProps & {
    enhancement: Theme,
    defaultTabIndex?: number
}

/**
 * The page of a theme in the settings.
 */
@savableSettings
@defaultContextProvider
export default class ThemePage extends React.Component<Props> {
    protected tabs: TabOption[] = [];

    protected SaveChanges: (...args: any[]) => any;
    protected Save: () => Promise<void>;
    protected _handleOptionsChange: (...args: any[]) => void;
    protected _handleSaveChangesClick: () => Promise<void>;

    constructor(props: Props, context?: any) {
        super(props, context);

        this.props.enhancement.settings && this.tabs.push({ name: "Settings" });
        this.SaveChanges = coroutine(this.onSaveChanges);
    }
    /**
     * Saves theme settings.
     * @param param0 Settings form output
     */
    protected *onSaveChanges({ values, isValid }) {
        if (isValid)
            // Change this if colour fields will be used
            window.ReGuilded.themes.assignProperties(this.props.enhancement, values);
    }
    render() {
        return (
            <ErrorBoundary>
                <EnhancementPage
                    type="theme"
                    iconName="icon-toolbar-images"
                    enhancement={this.props.enhancement}
                    enhancementHandler={window.ReGuilded.themes}
                    // Functions
                    switchTab={this.props.switchTab}
                    onSaveChanges={this.SaveChanges}
                    // Tabs
                    tabOptions={this.tabs}
                    defaultTabIndex={this.props.defaultTabIndex}>

                    { this.renderTabs() }
                </EnhancementPage>
            </ErrorBoundary>
        )
    }
    /**
     * Renders theme's page sub-tabs.
     * @returns Rendered sub-tabs
     */
    protected renderTabs(): ReactNode | ReactNode[] {
        const { enhancement } = this.props;

        return (
            enhancement.settings &&
            <div className="ReGuildedEnhancementPage-tab">
                {/* TODO: Settings saving */}
                <Form onChange={this._handleOptionsChange} formSpecs={{
                    header: "Settings",
                    sectionStyle: "border-unpadded",
                    sections: [
                        {
                            fieldSpecs: ThemeItem.generateSettingsFields(enhancement.settings, enhancement._settingsProps)
                        },
                        {
                            fieldSpecs: [
                                {
                                    type: "Button",

                                    buttonText: "Save",

                                    onClick: this._handleSaveChangesClick
                                }
                            ]
                        }
                    ]
                }}/>
            </div>
        );
    }
}