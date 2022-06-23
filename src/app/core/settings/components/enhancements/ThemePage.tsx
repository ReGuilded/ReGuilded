//#region Imports
import { ReactNode } from "react";
import { Theme, ThemeCssVariableType, ThemeSettings } from "../../../../../common/enhancements";
import { TabOption } from "../../../../guilded/components/sections";
import { FieldAnySpecs, FieldRadioSpecs, FieldTextSpecs, OptionRadioSpecs } from "../../../../guilded/form";
import validation from "../../validation";
import ErrorBoundary from "../ErrorBoundary";
import { PagedSettingsChildProps } from "../PagedSettings";
import EnhancementPage from "./EnhancementPage";

const React = window.ReGuilded.getApiProperty("react"),
    { default: savableSettings } = window.ReGuilded.getApiProperty("guilded/settings/savableSettings"),
    { default: defaultContextProvider } = window.ReGuilded.getApiProperty("guilded/context/defaultContextProvider"),
    { coroutine } = window.ReGuilded.getApiProperty("guilded/util/functions"),
    { default: GuildedText } = window.ReGuilded.getApiProperty("guilded/components/GuildedText"),
    { default: CardWrapper } = window.ReGuilded.getApiProperty("guilded/components/CardWrapper"),
    { default: SimpleToggle } = window.ReGuilded.getApiProperty("guilded/components/SimpleToggle"),
    { default: Form } = window.ReGuilded.getApiProperty("guilded/components/Form");
//#endregion

type Props = PagedSettingsChildProps & {
    enhancement: Theme;
    defaultTabIndex?: number;
};

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

        this.props.enhancement.extensions && this.tabs.push({ name: "Extensions" });
        this.props.enhancement.settings && this.tabs.push({ name: "Settings" });

        this.SaveChanges = coroutine(this.onSaveChanges);
    }
    /**
     * Saves theme settings.
     * @param param0 Settings form output
     */
    protected *onSaveChanges({ values, isValid }) {
        if (isValid) {
            const fixedValues = ThemePage.fixFormValues(values, this.props.enhancement.settings, this.props.enhancement._settingsProps);

            // Change this if colour fields will be used
            window.ReGuilded.themes.assignProperties(this.props.enhancement, fixedValues);
        }
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
                    defaultTabIndex={this.props.defaultTabIndex}
                >
                    {this.renderTabs()}
                </EnhancementPage>
            </ErrorBoundary>
        );
    }
    /**
     * Renders theme's page sub-tabs.
     * @returns Rendered sub-tabs
     */
    protected renderTabs(): ReactNode | ReactNode[] {
        const { enhancement } = this.props;

        return [
            enhancement.extensions && (
                <div className="ReGuildedEnhancementPage-tab ReGuildedEnhancementPage-tab-grid">
                    {enhancement.extensions.map((extension) => (
                        <CardWrapper>
                            <SimpleToggle label={extension.name} className="ReGuildedThemeExtension-toggle" />
                            <GuildedText block type="subtext">
                                {extension.description || "No description provided."}
                            </GuildedText>
                        </CardWrapper>
                    ))}
                </div>
            ),

            enhancement.settings && (
                <div className="ReGuildedEnhancementPage-tab">
                    <Form
                        onChange={this._handleOptionsChange}
                        formSpecs={{
                            header: "Settings",
                            sectionStyle: "border-unpadded",
                            sections: [
                                {
                                    fieldSpecs: ThemePage.generateSettingsFields(enhancement.settings, enhancement._settingsProps)
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
                        }}
                    />
                </div>
            )
        ];
    }
    static generateSettingsFields(settings: ThemeSettings, settingsProps: string[]): FieldAnySpecs[] {
        return settingsProps.map<FieldRadioSpecs | FieldTextSpecs>((prop) => {
            const { type, name, value, options } = settings[prop];

            return options
                ? {
                      type: "Radios",
                      fieldName: prop,

                      label: name,
                      defaultValue: { optionName: value as number },

                      options: options.map((option, index) => ({
                          optionName: index,
                          label: option.name
                      }))
                  }
                : {
                      type: "Text",
                      fieldName: prop,

                      header: name,
                      label: type ? `Value (${type})` : "Value",
                      defaultValue: value as string,

                      inputType: type == "number" ? type : undefined,
                      validationFunction: validation[type],

                      grow: 1
                  };
        });
    }
    static fixFormValues(
        values: {
            [fieldName: string]: string | number | undefined | null | OptionRadioSpecs;
        },
        settings: ThemeSettings,
        settingsProps: string[]
    ): { [name: string]: ThemeCssVariableType } {
        const valuesCopy = Object.assign({}, values);

        // Since .options forces to use radio
        for (let prop of settingsProps) if (settings[prop].options) valuesCopy[prop] = (values[prop] as OptionRadioSpecs).optionName as ThemeCssVariableType;

        return valuesCopy as { [name: string]: ThemeCssVariableType };
    }
}
