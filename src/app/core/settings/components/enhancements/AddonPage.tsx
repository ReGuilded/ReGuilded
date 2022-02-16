//#region Imports
import { Addon } from "../../../../../common/enhancements";
import { FormOutput } from "../../../../guilded/form";
import ErrorBoundary from "../ErrorBoundary";
import { PagedSettingsChildProps } from "../PagedSettings";
import EnhancementPage from "./EnhancementPage";

const React = window.ReGuilded.getApiProperty("react"),
    { default: Form } = window.ReGuilded.getApiProperty("guilded/components/Form"),
    { default: NullState } = window.ReGuilded.getApiProperty("guilded/components/NullState"),
    { default: savableSettings } = window.ReGuilded.getApiProperty("guilded/settings/savableSettings"),
    { default: defaultContextProvider } = window.ReGuilded.getApiProperty("guilded/context/defaultContextProvider"),
    { coroutine } = window.ReGuilded.getApiProperty("guilded/util/functions"),
    { default: BannerWithButton } = window.ReGuilded.getApiProperty("guilded/components/BannerWithButton"),
    { default: CodeContainer } = window.ReGuilded.getApiProperty("guilded/components/CodeContainer");
//#endregion

type Props = PagedSettingsChildProps & {
    enhancement: Addon,
    defaultTabIndex?: number
};

/**
 * The page of an addon in the settings.
 */
@savableSettings
@defaultContextProvider
export default class AddonPage extends React.Component<Props> {
    protected SaveChanges: (...args: any[]) => any;
    protected Save: () => Promise<void>;
    protected _handleOptionsChange: (...args: any[]) => void;
    protected _handleSaveChangesClick: () => Promise<void>;

    _SaveBinded: () => Promise<void>;

    constructor(props: Props, context?: any) {
        super(props, context);

        this.SaveChanges = coroutine(this.onSaveChanges);
    }
    // See EnhancementPage onSaveChanges for documentation
    protected *onSaveChanges({ values: { permissions }, isValid }: FormOutput<{ permissions: Array<{ optionName: number, value: boolean }> }>) {
        const givenPermissions = permissions.map(x => x.value && x.optionName).reduce((a, b) => a | b);

        window.ReGuilded.addons.setPermissions(this.props.enhancement.id, givenPermissions);
    }
    render() {
        return (
            <ErrorBoundary>
                <EnhancementPage
                    type="addon"
                    enhancement={this.props.enhancement}
                    enhancementHandler={window.ReGuilded.addons}
                    // Functions
                    switchTab={this.props.switchTab}
                    onSaveChanges={this.SaveChanges}
                    // Tabs
                    tabOptions={[ { name: "Permissions" } ]}
                    defaultTabIndex={this.props.defaultTabIndex}
                    overviewBanner={this.renderErrorBannerIfNeeded()}>

                    { this.renderTabs() }
                </EnhancementPage>
            </ErrorBoundary>
        )
    }
    /**
     * Renders error banner if error has occurred while loading the addon.
     * @returns Optional error banner
     */
    private renderErrorBannerIfNeeded() {
        const { _error, repoUrl } = this.props.enhancement;

        return (
            typeof _error !== "undefined" &&
                // TODO: Insufficient permissions should have a different error
                <BannerWithButton theme="error"
                    title="An error occurred"
                    className="ReGuildedEnhancementPage-banner"
                    text={[
                        "The addon has threw an error while getting its exports or loading it:",
                        <CodeContainer language="javascript" readOnly={true} canCopyContents={true} code={_error.toString()} />,
                        "Make sure it's given sufficient permissions for it to start."
                    ]}
                    buttonProps={repoUrl && {
                        buttonText: "Report",
                        buttonType: "bleached",
                        style: "hollow",
                        // Only GitHub and GitLab are allowed and it's valid for both
                        // TODO: Gitea and BitBucket support
                        href: `${repoUrl}/issues/new`
                    }}/>
        );
    }
    /**
     * Renders addon's page sub-tabs.
     * @returns Rendered sub-tabs
     */
    protected renderTabs() {
        const { id, requiredPermissions } = this.props.enhancement;
        const presentPermissions = window.ReGuilded.addons.getPermissionsOf(id);

        return (
            <div className="ReGuildedEnhancementPage-tab">
                { requiredPermissions
                    ? <>
                        <BannerWithButton theme="warning" iconName="icon-filter" className="ReGuildedEnhancementPage-banner" text="Basic information that can't be used maliciously will be given by default. Please DO NOT give a permission to an addon if you do not know how it will be used."/>
                        <Form onChange={this._handleOptionsChange} formSpecs={{
                            sections: [
                                {
                                    fieldSpecs: [
                                        {
                                            type: "Checkboxes",
                                            fieldName: "permissions",

                                            options: [
                                                requiredPermissions & 1 && {
                                                    optionName: 1,
                                                    label: "Use DOM & React",
                                                    description: "Allows using elements and React components to create some kind of UI, or even modify them.\nCons: This may be used to break GUI, create unwanted content, change the look of the app or even disable themes.\nPros: This allows creating settings or GUI that addon needs or display its contents."
                                                },
                                                requiredPermissions & 4 && {
                                                    optionName: 4,
                                                    label: "Extra Data",
                                                    description: "Adds extra data to an addon. This can be used to gather information that the addon typically wouldn't need to use, but may be mandatory for some.\nE.g., this allows fetching data of certain member in a team. While this isn't necessarily bad, this could be used to do unknown exploits."
                                                },
                                                requiredPermissions & 8 && {
                                                    optionName: 8,
                                                    label: "Use Guilded API",
                                                    description: "Allows doing anything on behalf of you. This does not hand out your passwords or any sensitive information, but it can still be used to make malicious API calls under your account (including password resetting) or gather more information about you. This may be mandatory to some addons."
                                                },
                                                requiredPermissions & 16 && {
                                                    optionName: 16,
                                                    label: "Use External API",
                                                    description: "Allows doing calls to an external server outside Guilded. This may be mandatory for some addons to function, but can be used to send unwanted information to a server."
                                                }
                                            ].filter(Boolean),

                                            defaultValue: [
                                                {
                                                    optionName: 1,
                                                    value: presentPermissions & 1
                                                },
                                                {
                                                    optionName: 4,
                                                    value: presentPermissions & 4
                                                },
                                                {
                                                    optionName: 8,
                                                    value: presentPermissions & 8
                                                },
                                                {
                                                    optionName: 16,
                                                    value: presentPermissions & 16
                                                }
                                            ]
                                        },
                                        {
                                            type: "Button",

                                            buttonText: "Save",
                                            onClick: this._handleSaveChangesClick
                                        }
                                    ]
                                }
                            ]
                        }}/>
                    </>
                    : <NullState type="nothing-here" title="No permission to set" subtitle="This addon does not require any permissions." />
                }
            </div>
        );
    }
}