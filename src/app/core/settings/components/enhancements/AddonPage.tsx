//#region Imports
import { AddonPermissionInfos, AddonPermissionValues } from "../../../../addons/addonPermission";
import { Addon } from "../../../../../common/enhancements";
import { PagedSettingsChildProps } from "../PagedSettings";
import { FormOutput } from "../../../../guilded/form";
import EnhancementPage from "./EnhancementPage";
import ErrorBoundary from "../ErrorBoundary";

const React = window.ReGuilded.getApiProperty("react"),
    { default: Form } = window.ReGuilded.getApiProperty("guilded/components/Form"),
    { default: NullState } = window.ReGuilded.getApiProperty("guilded/components/NullState"),
    { default: savableSettings } = window.ReGuilded.getApiProperty("guilded/settings/savableSettings"),
    { default: defaultContextProvider } = window.ReGuilded.getApiProperty("guilded/context/defaultContextProvider"),
    { coroutine } = window.ReGuilded.getApiProperty("guilded/util/functions"),
    { default: CheckboxV2 } = window.ReGuilded.getApiProperty("guilded/components/CheckboxV2"),
    { default: BannerWithButton } = window.ReGuilded.getApiProperty("guilded/components/BannerWithButton"),
    { default: CodeContainer } = window.ReGuilded.getApiProperty("guilded/components/CodeContainer");
//#endregion

type Props = PagedSettingsChildProps & {
    enhancement: Addon;
    className?: string;
    defaultTabIndex?: number;
};

/**
 * The page of an addon in the settings.
 */
@savableSettings
@defaultContextProvider
export default class AddonPage extends React.Component<Props> {
    protected SaveChanges: (...args: unknown[]) => unknown;
    protected Save: () => Promise<void>;
    protected _handleOptionsChange: (...args: unknown[]) => void;
    protected _handleSaveChangesClick: () => Promise<void>;

    _SaveBinded: () => Promise<void>;

    constructor(props: Props, context?: unknown) {
        super(props, context);

        this.SaveChanges = coroutine(this.onSaveChanges);
    }
    // See EnhancementPage onSaveChanges for documentation
    protected *onSaveChanges({
        values: { permissions },
        isValid
    }: FormOutput<{
        permissions: Array<{ optionName: number; value: boolean }>;
    }>) {
        if (!isValid) return;

        const givenPermissions = permissions.map((x) => x.value && x.optionName).reduce((a, b) => a | b);

        yield window.ReGuilded.addons.setPermissions(this.props.enhancement.id, givenPermissions);
    }
    render() {
        return (
            <ErrorBoundary>
                <EnhancementPage
                    type="addon"
                    iconName="icon-toolbar-code"
                    enhancement={this.props.enhancement}
                    enhancementHandler={window.ReGuilded.addons}
                    // Functions
                    switchTab={this.props.switchTab}
                    onSaveChanges={this.SaveChanges}
                    // Tabs
                    tabOptions={[{ name: "Permissions" }]}
                    defaultTabIndex={this.props.defaultTabIndex}
                    pageInfoBanner={this.renderErrorBannerIfNeeded()}
                >
                    {this.renderTabs()}
                </EnhancementPage>
            </ErrorBoundary>
        );
    }
    /**
     * Renders error banner if error has occurred while loading the addon.
     * @returns Optional error banner
     */
    private renderErrorBannerIfNeeded() {
        const { _error, _missingPerms, repoUrl } = this.props.enhancement;

        return (
            typeof _error != "undefined" && (
                // Error banner
                <BannerWithButton
                    theme="error"
                    title="An error occurred"
                    className="ReGuildedEnhancementPage-banner"
                    text={
                        _missingPerms ? (
                            // Permission error
                            <div className="ReGuildedEnhancementPage-banner-content">
                                The addon has required a module that required the given permissions:
                                <div className="ReGuildedEnhancementPage-missing-perms">
                                    {AddonPermissionValues.filter((permission) => _missingPerms & permission).map((permission) => {
                                        const presentPermissions = window.ReGuilded.addons.getPermissionsOf(this.props.enhancement.id),
                                            permissionInfo = AddonPermissionInfos[permission];

                                        // Indicates if it was given. This is only for methods that
                                        // require multiple permissions
                                        return (
                                            <CheckboxV2
                                                className="ReGuildedEnhancementPage-missing-perm"
                                                isCircular
                                                // Disallow it from checking
                                                disabled
                                                label={permissionInfo.name}
                                                description={permissionInfo.description}
                                                defaultValue={presentPermissions & permission}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            // Regular error
                            [
                                "The addon has threw an error while getting its exports or loading it:",
                                <CodeContainer language="javascript" readOnly={true} canCopyContents={true} code={_error.toString()} />
                            ]
                        )
                    }
                    buttonProps={
                        repoUrl &&
                        !_missingPerms && {
                            buttonText: "Report",
                            buttonType: "bleached",
                            style: "hollow",
                            // Only GitHub and GitLab are allowed and it's valid for both
                            // TODO: Gitea and BitBucket support
                            href: `${repoUrl}/issues/new`
                        }
                    }
                />
            )
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
                {requiredPermissions ? (
                    <>
                        <BannerWithButton
                            theme="warning"
                            iconName="icon-filter"
                            className="ReGuildedEnhancementPage-banner"
                            text="Basic information that can't be used maliciously will be given by default. Please DO NOT give a permission to an addon if you do not know how it will be used."
                        />
                        <Form
                            onChange={this._handleOptionsChange}
                            formSpecs={{
                                sections: [
                                    {
                                        fieldSpecs: [
                                            {
                                                type: "Checkboxes",
                                                fieldName: "permissions",

                                                options: AddonPermissionValues.filter((permission) => requiredPermissions & permission)
                                                    // Checkbox
                                                    .map((permission) => ({
                                                        optionName: permission,
                                                        label: AddonPermissionInfos[permission].name,
                                                        description: AddonPermissionInfos[permission].description
                                                    })),

                                                defaultValue: AddonPermissionValues.map((permission) => ({
                                                    optionName: permission,
                                                    value: presentPermissions & permission
                                                }))
                                            },
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
                    </>
                ) : (
                    <NullState type="nothing-here" title="No permission to set" subtitle="This addon does not require unknown permissions." />
                )}
            </div>
        );
    }
}
