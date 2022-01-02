import ExtensionManager, { Extension } from "../../../managers/extension";
import { ChildTabProps } from "../TabbedSettings";
import ErrorBoundary from "../ErrorBoundary";
import { ReactElement } from "react";
import { shell } from "electron";

const { React, SvgIcon, GuildedText, Form, OverlayProvider } = window.ReGuildedApi;

type Props<T> = ChildTabProps & { extension: T };

@OverlayProvider(["DeleteConfirmationOverlay"])
export default abstract class ExtensionView<T extends Extension<string | string[]>> extends React.Component<ChildTabProps, { enabled: boolean | number }> {
    // Class functions with proper `this` to not rebind every time
    private _onToggleBinded: () => Promise<void>;
    private _onDeleteBinded: () => Promise<void>;
    private _openDirectory: () => Promise<void>;
    // Configuration
    protected type: string;
    protected extensionManager: ExtensionManager<T>;
    // From overlay provider
    protected DeleteConfirmationOverlay: { Open: ({ name: string }) => Promise<{ confirmed: boolean }> };
    constructor(props: Props<T>, context?: any) {
        super(props, context);

        this.state = {
            enabled: ~window.ReGuilded.themesManager.enabled.indexOf(this.props.extension.id)
        };
        this._onToggleBinded = this._onToggle.bind(this);
        this._onDeleteBinded = this._onDelete.bind(this);
        this._openDirectory = shell.openItem.bind(null, this.props.extension.dirname);
    }
    /**
     * Toggles the extension's enabled state.
     * @param enabled The new extension state
     */
    private async _onToggle(): Promise<void> {
        await this.extensionManager[this.state.enabled ? "savedUnload" : "savedLoad"](this.props.extension)
            .then(() => this.setState({ enabled: !this.state.enabled }));
    }
    /**
     * Confirms whether the extension should be deleted and deletes it if the modal is confirmed.
     */
    private async _onDelete(): Promise<void> {
        await this.DeleteConfirmationOverlay.Open({ name: this.type })
            .then(async ({ confirmed }) => confirmed && await this.extensionManager.delete(this.props.extension))
            // To not stay in the screen and break something
            .then(() => this.props.switchTab('list', { extension: {} }));
    }
    /**
     * Renders additional content for the extension.
     * @param extension The current extension
     * @returns Additional content
     */
    abstract renderContent(extension: T): ReactElement | ReactElement[];
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
        const { switchTab, extension } = this.props;
        return (
            <ErrorBoundary>
                <div className="OptionsMenuPageWrapper-container ReGuildedExtensionPage-wrapper" style={{ paddingLeft: "32px", paddingRight: "32px" }}>
                    <div className="ReGuildedExtensionPage-container">
                        <header className="ReGuildedExtensionPage-header DocsDisplayV2-title">
                            {/* <| */}
                            <div className="BackLink-container BackLink-container-desktop BackLink-container-size-md ScreenHeader-back" onClick={() => switchTab("list", { extension: {} })}>
                                <SvgIcon iconName="icon-back" className="BackLink-icon"/>
                            </div>
                            {/* Title */}
                            <GuildedText type="heading3">{ extension.name } settings</GuildedText>
                        </header>
                        <div className="ReGuildedExtensionPage-content">
                            {/* Description */}
                            { extension.readme?.length ? window.ReGuildedApi.renderMarkdown(extension.readme) : null }
                            { this.renderContent(extension) }
                            { this.renderActionForm() }
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        )
    }
}