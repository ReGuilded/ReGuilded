import reGuildedInfo from "../../../../common/reguilded.json";
import ErrorBoundary from "./ErrorBoundary";

const { Form, React, SavableSettings, functionUtil: { coroutine }, OverlayProvider, DefaultContextProvider } = window.ReGuildedApi;

enum Badge {
    None = 0,
    Flair = 1,
    Badge = 2
}
type GeneralSettingsValues = {
    loadAuthors: boolean,
    badge: { optionName: string }
}
const FakeUpdateJson = {
    DownloadZip: "https://github.com/ReGuilded/ReGuilded/archive/refs/tags/v0.0.3-alpha.zip",
    Sha256Zip: "",

};

@SavableSettings
@DefaultContextProvider
@OverlayProvider(["SimpleConfirmationOverlay"])
export default class GeneralSettings extends React.Component {
    // Number to name map for radio default value
    static badgeNames = ["None", "Flair", "Badge"];

    private SaveChanges: (...args: object[]) => any;
    private Update: () => Promise<void>;
    // Defined by SavableSettings & OverlayProvider
    protected _handleOptionsChange: () => void;
    protected SimpleConfirmationOverlay: { Open: (settings: any) => Promise<{ confirmed: boolean}> };
    protected statusContext;

    constructor(props, context) {
        super(props, context);
        this.SaveChanges = coroutine(this.onSaveChanges);
        this.Update = this.onUpdate.bind(this);
    }
    private *onSaveChanges({ values, isValid }) {
        if(isValid) {
            const { loadAuthors, badge: { optionName: badge } }: GeneralSettingsValues = values;
            // Since we need to convert form values to proper values
            // (E.g., radios always returning { optionName: "xyz" } instead of "xyz")
            const configValues = { loadAuthors: loadAuthors, badge: Badge[badge] }
            return window.ReGuilded.settingsHandler.updateSettings(configValues);
        } else throw new Error("Invalid settings form values");
    }
    private async onUpdate() {
        const { statusContext } = this;

        await window.ReGuildedConfig
            .checkForUpdate().then(async ([ updateExists, updateInfo ]) =>
                // Allow the update to be cancelled
                updateExists && await this.SimpleConfirmationOverlay.Open({
                    header: "Update ReGuilded",
                    text: `Version '${updateInfo.version}' of ReGuilded has been found. Do you want to update to it?`,
                    confirmText: "Update",
                    confirmType: "success"
                })
                    .then(async ({ confirmed }) =>
                        // Display ephermal status messages for users to see
                        confirmed && await window.ReGuildedConfig.doUpdateIfPossible()
                            .then(() => statusContext.displayStatus({
                                text: "ReGuilded update finished. CTRL + R to refresh",
                                type: "success"
                            }))
                            .catch(e => {
                                if (typeof e === "string")
                                    statusContext.displayError({ message: e, error: e });
                                else statusContext.displayError({ message: e.message, error: e });
                            })
                    )
            );
    }
    render() {
        const { settings } = window.ReGuilded.settingsHandler;

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
                                    description: "Loads addon and theme authors.",

                                    defaultValue: settings.loadAuthors
                                },
                                {
                                    type: "Radios",
                                    fieldName: "badge",
                                    isOptional: false,

                                    label: "Badge handling",
                                    description: "(DOESN'T WORK YET) This determines how to handle ReGuilded maintainer and other badges.",
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
                                    defaultValue: { optionName: GeneralSettings.badgeNames[settings.badge] }
                                }
                            ]
                        },
                        {
                            fieldSpecs: [
                                {
                                    type: "Button",
                                    buttonText: "Check for updates",
                                    description: `Current installed versison: ${reGuildedInfo.version}`,
                                    onClick: this.Update
                                }
                            ]
                        }
                    ]
                }}/>
            </ErrorBoundary>
        );
    }
}