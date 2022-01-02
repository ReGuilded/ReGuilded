import ErrorBoundary from "./ErrorBoundary";

const { Form, React, SavableSettings, functionUtil: { coroutine } } = window.ReGuildedApi;

enum Badge {
    None = 0,
    Flair = 1,
    Badge = 2
}

@SavableSettings
export default class GeneralSettings extends React.Component {
    static badgeNames = ["None", "Flair", "Badge"];

    SaveChanges: (...args: object[]) => any;
    _handleOptionsChange: () => void;
    constructor(props, context) {
        super(props, context);
        this.SaveChanges = coroutine(this.onSaveChanges);
    }
    *onSaveChanges({ values, isValid }) {
        if(isValid) {
            const { loadAuthors, badge: { optionName: badge } } = values;
            // Since we need to convert form values to proper values
            // (E.g., radios always returning { optionName: "xyz" } instead of "xyz")
            const configValues = { loadAuthors: loadAuthors, badge: Badge[badge] }
            return window.ReGuilded.settingsManager.updateSettings(configValues);
        } else throw new Error("Invalid settings form values");
    }
    render() {
        const { config } = window.ReGuilded.settingsManager;
        // TODO: Make badge radio functional with onChange
        return (
            <ErrorBoundary>
                <Form onChange={this._handleOptionsChange} formSpecs={{
                    header: "ReGuilded General Settings",
                    sectionStyle: "border",
                    sections: [
                        {
                            rowMarginSize: "lg",
                            fieldSpecs: [
                                {
                                    type: "Switch",
                                    fieldName: "loadAuthors",

                                    label: "Load Extension Authors",
                                    description: "Loads add-on and theme authors.",

                                    defaultValue: config.loadAuthors
                                },
                                {
                                    type: "Radios",
                                    fieldName: "badge",
                                    isOptional: false,
                                    
                                    label: "Badge handling",
                                    description: "This determines how to handle ReGuilded maintainer and other badges.",
                                    isDescriptionAboveField: true,
                                    
                                    layout: "vertical",
                                    isPanel: true,
                                    isCheckbox: true,
                                    options: [
                                        {
                                            optionName: "Badge",
                                            layout: "horizontal",
                                            label: "Show as a badge",
                                            shortLabel: "Badge",
                                            description: "Shows ReGuilded badges as global badges like partner badge."
                                        },
                                        {
                                            optionName: "Flair",
                                            layout: "horizontal",
                                            label: "Show as a flair",
                                            shortLabel: "Flair",
                                            description: "Shows ReGuilded badges as global flairs like stonks flair."
                                        },
                                        {
                                            optionName: "None",
                                            layout: "horizontal",
                                            label: "Don't show",
                                            shortLabel: "Hide",
                                            description: "This hides all ReGuilded badges."
                                        },
                                    ],
                                    defaultValue: { optionName: GeneralSettings.badgeNames[config.badge] }
                                }
                            ]
                        }
                    ]
                }}/>
            </ErrorBoundary>
        );
    }
}