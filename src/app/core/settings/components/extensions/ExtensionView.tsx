import { ProvidedOverlay } from "../../../../addons/addonApi.types";
import { AnyExtension } from "../../../../../common/extensions";
import { RGExtensionConfig } from "../../../../types/reguilded";
import ExtensionHandler from "../../../handlers/extension";
import { ChildTabProps } from "../TabbedSettings";
import PreviewCarousel from "./PreviewCarousel";
import ErrorBoundary from "../ErrorBoundary";
import { ReactElement } from "react";
import { FormOutput } from "../../../../guilded/form";

const React = window.ReGuilded.getApiProperty("react"),
    { default: SvgIcon } = window.ReGuilded.getApiProperty("guilded/components/SvgIcon"),
    { default: GuildedText } = window.ReGuilded.getApiProperty("guilded/components/GuildedText"),
    { default: Form } = window.ReGuilded.getApiProperty("guilded/components/Form"),
    { default: overlayProvider } = window.ReGuilded.getApiProperty("guilded/overlays/overlayProvider"),
    { default: savableSettings } = window.ReGuilded.getApiProperty("guilded/settings/savableSettings"),
    { default: defaultContextProvider } = window.ReGuilded.getApiProperty("guilded/context/defaultContextProvider"),
    { coroutine } = window.ReGuilded.getApiProperty("guilded/util/functions"),
    { default: MarkdownRenderer } = window.ReGuilded.getApiProperty("guilded/components/MarkdownRenderer"),
    { default: { WebhookEmbed } } = window.ReGuilded.getApiProperty("guilded/editor/grammars"),
    { default: HorizontalTabs } = window.ReGuilded.getApiProperty("guilded/components/HorizontalTabs");

type Props<T> = ChildTabProps & { extension: T };

@savableSettings
@defaultContextProvider
@overlayProvider(["DeleteConfirmationOverlay"])
export default abstract class ExtensionView<T extends AnyExtension> extends React.Component<Props<T>, { enabled: boolean | number }> {
    // Class functions with proper `this` to not rebind every time
    private _onToggleBinded: () => Promise<void>;
    private _onDeleteBinded: () => Promise<void>;
    private _openDirectory: () => Promise<void>;

    // Configuration
    protected type: string;
    protected extensionHandler: ExtensionHandler<T, RGExtensionConfig<T>>;
    protected tabs = [ { name: "Overview" } ];

    // From decorators
    protected DeleteConfirmationOverlay: ProvidedOverlay<"DeleteConfirmationOverlay">;
    protected SaveChanges: (...args: any[]) => any;
    protected Save: () => Promise<void>;
    protected _handleOptionsChange: (...args: any[]) => void;

    constructor(props: Props<T>, context?: any) {
        super(props, context);

        this.state = {
            enabled: ~window.ReGuilded.themes.enabled.indexOf(this.props.extension.id)
        };
        this._onToggleBinded = this._onToggle.bind(this);
        this._onDeleteBinded = this._onDelete.bind(this);
        this._openDirectory = window.ReGuildedConfig.openItem.bind(null, this.props.extension.dirname);
        this.SaveChanges = coroutine(this.onSaveChanges);
    }
    protected abstract onSaveChanges(formOutput: FormOutput): Iterable<PromiseLike<unknown>>;
    /**
     * Toggles the extension's enabled state.
     * @param enabled The new extension state
     */
    private async _onToggle(): Promise<void> {
        await this.extensionHandler[this.state.enabled ? "savedUnload" : "savedLoad"](this.props.extension)
            .then(() => this.setState({ enabled: !this.state.enabled }));
    }
    /**
     * Confirms whether the extension should be deleted and deletes it if the modal is confirmed.
     */
    private async _onDelete(): Promise<void> {
        await this.DeleteConfirmationOverlay.Open({ name: this.type })
            .then(async ({ confirmed }) => confirmed && await this.extensionHandler.delete(this.props.extension))
            // To not stay in the screen and break something
            .then(() => this.props.switchTab('list', { extension: {} }));
    }
    /**
     * Renders additional content for the extension.
     * @param extension The current extension
     * @returns Additional content
     */
    protected abstract renderTabs(extension: T): ReactElement | ReactElement[];
    /**
     * Returns the action form component depending on the state.
     * @returns Form element
     */
    private renderActionForm(): ReactElement {
        const [buttonType, buttonText] = this.state.enabled ? ["delete", "Disable"] : ["success", "Enable"],
              { _onToggleBinded, _onDeleteBinded, _openDirectory } = this;

        return (
            <Form formSpecs={{
                sectionStyle: "border-unpadded",
                sections: [
                    {
                        header: "Actions",
                        fieldSpecs: [
                            {
                                type: "Button",
                                fieldName: "stateChange",
                                buttonText,

                                buttonType,
                                grow: 0,
                                rowCollapseId: "button-list",

                                onClick: _onToggleBinded
                            },
                            {
                                type: "Button",
                                fieldName: "directory",
                                buttonText: "Open directory",

                                buttonType: "bleached",
                                style: "hollow",
                                grow: 0,
                                rowCollapseId: "button-list",

                                onClick: _openDirectory
                            },
                            {
                                type: "Button",
                                fieldName: "delete",
                                buttonText: "Delete",

                                buttonType: "delete",
                                style: "hollow",
                                grow: 0,
                                rowCollapseId: "button-list",

                                onClick: _onDeleteBinded
                            }
                        ]
                    }
                ]
            }}/>
        );
    }
    render() {
        const { props: { switchTab, extension, defaultTabIndex }, tabs } = this;

        return (
            <ErrorBoundary>
                <div className="OptionsMenuPageWrapper-container ReGuildedExtensionPage-wrapper" style={{ paddingLeft: 32, paddingRight: 32, maxWidth: "100%" }}>
                    <div className="ReGuildedExtensionPage-container">
                        <header className="ReGuildedExtensionPage-header DocsDisplayV2-title">
                            {/* <| */}
                            <div className="BackLink-container BackLink-container-desktop BackLink-container-size-md ScreenHeader-back" onClick={() => switchTab("list", { extension: {} })}>
                                <SvgIcon iconName="icon-back" className="BackLink-icon"/>
                            </div>
                            {/* Title */}
                            <GuildedText type="heading3">{ extension.name } settings</GuildedText>
                        </header>
                        <HorizontalTabs type="compact" renderAllChildren={false} tabSpecs={{ TabOptions: tabs }} defaultSelectedTabIndex={defaultTabIndex}>
                            <div className="ReGuildedExtensionPage-tab">
                                {/* Description */}
                                { extension.readme?.length ? <MarkdownRenderer plainText={extension.readme} grammar={WebhookEmbed}/> : null }
                                {/* Preview images carousel */}
                                { extension.images && window.ReGuilded.settingsHandler.settings.loadImages &&
                                    <PreviewCarousel extensionId={extension.id} extensionHandler={this.extensionHandler} />
                                }
                                { this.renderActionForm() }
                            </div>
                            { this.renderTabs(extension) }
                        </HorizontalTabs>
                    </div>
                </div>
            </ErrorBoundary>
        )
    }
}