import reGuildedInfo from "../../../../common/reguilded.json";
import ErrorBoundary from "./ErrorBoundary";

const {
    "guilded/components/Form": { default: Form },
    react: React,
    "guilded/settings/savableSettings": { default: savableSettings },
    "guilded/util/functions": { coroutine },
    "guilded/overlays/overlayProvider": { default: overlayProvider },
    "guilded/context/defaultContextProvider": { default: defaultContextProvider }
} = window.ReGuildedApi;

enum Badge {
    None = 0,
    Flair = 1,
    Badge = 2
}
type GeneralSettingsValues = {
    loadAuthors: boolean,
    keepSplash: boolean,
    badge: { optionName: string },
    autoUpdate: boolean
}

@savableSettings
@defaultContextProvider
@overlayProvider(["SimpleConfirmationOverlay"])
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
            const { loadAuthors, badge: { optionName: badge }, keepSplash, autoUpdate }: GeneralSettingsValues = values;
            // Since we need to convert form values to proper values
            // (E.g., radios always returning { optionName: "xyz" } instead of "xyz")
            const configValues = { loadAuthors, badge: Badge[badge], keepSplash, autoUpdate }
            return window.ReGuilded.settingsHandler.updateSettings(configValues);
        } else throw new Error("Invalid settings form values");
    }
    private async onUpdate() {
        const { statusContext } = this;

        await window.ReGuildedConfig
            .checkForUpdate().then(async ([ updateExists, updateInfo ]) => {
                // Allow the update to be cancelled
                if (updateExists)
                    await this.SimpleConfirmationOverlay.Open({
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
                // Notify that there is no update
                else statusContext.displayStatus({ text: "No ReGuilded update has been found", type: "info" });
            });
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
                                    fieldName: "autoUpdate",

                                    label: "Auto-Update",
                                    description: "Every time Guilded is launched or gets refreshed, ReGuilded checks for its own updates and installs them if they exists.",

                                    defaultValue: settings.autoUpdate
                                }
                            ]
                        },
                        {
                            fieldSpecs: [
                                {
                                    type: "Button",
                                    buttonText: "Check for updates",
                                    description: `Currently installed version: ${reGuildedInfo.version}`,
                                    onClick: this.Update
                                }
                            ]
                        }
                    ]
                }}/>
                <Form onChange={this._handleOptionsChange} formSpecs={{
                    sectionStyle: "indented-padded",
                    sections: [
                        {
                            header: "Advanced",
                            isCollapsible: true,
                            rowMarginSize: "md",
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
                                        // {
                                        //     optionName: "Flair",
                                        //     layout: "horizontal",
                                        //     label: "Show as a flair",
                                        //     shortLabel: "Flair",
                                        //     description: "Shows ReGuilded badges as global flairs like stonks flair."
                                        // },
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
                            header: "Developer Options",
                            isCollapsible: true,
                            rowMarginSize: "md",
                            fieldSpecs: [
                                {
                                    type: "Switch",
                                    fieldName: "keepSplash",
                                    label: "Keep Loading Screen",
                                    description: "Keeps Splash/Loading Screen Open",

                                    defaultValue: settings.keepSplash
                                },
                                {
                                    type: "Switch",
                                    fieldName: "debugMode",
                                    label: "Debug Mode",
                                    description: "Enabled Debug Mode, meaning ReGuilded will output debug lines to Dev Tools.",

                                    defaultValue: settings.debugMode
                                }
                            ]
                        }
                    ]
                }}/>
            </ErrorBoundary>
        );
    }
}