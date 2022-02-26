//#region Imports
import { ProvidedOverlay } from "../../../../guilded/decorators";
import { AnyEnhancement } from "../../../../../common/enhancements";
import { RGEnhancementConfig } from "../../../../types/reguilded";
import EnhancementHandler from "../../../handlers/enhancement";
import PreviewCarousel from "./PreviewCarousel";
import ErrorBoundary from "../ErrorBoundary";
import { ReactElement, ReactNode } from "react";
import { FormOutput } from "../../../../guilded/form";
import { BannerWithButton } from "../../../../guilded/components/content";
import { TabOption } from "../../../../guilded/components/sections";

const React = window.ReGuilded.getApiProperty("react"),
    { default: GuildedText } = window.ReGuilded.getApiProperty("guilded/components/GuildedText"),
    { default: Form } = window.ReGuilded.getApiProperty("guilded/components/Form"),
    { default: ScreenHeader } = window.ReGuilded.getApiProperty("guilded/components/ScreenHeader"),
    { default: overlayProvider } = window.ReGuilded.getApiProperty("guilded/overlays/overlayProvider"),
    { default: MarkdownRenderer } = window.ReGuilded.getApiProperty("guilded/components/MarkdownRenderer"),
    { default: { WebhookEmbed } } = window.ReGuilded.getApiProperty("guilded/editor/grammars"),
    { default: HorizontalTabs } = window.ReGuilded.getApiProperty("guilded/components/HorizontalTabs");
//#endregion

type Props<T extends AnyEnhancement> = {
    type: string,
    iconName: string,
    enhancementHandler: EnhancementHandler<T, RGEnhancementConfig<T>>,
    enhancement: T,

    onSaveChanges: (formOutput: FormOutput) => PromiseLike<unknown> | Iterable<PromiseLike<unknown>> | unknown,
    switchTab: Function,

    tabOptions: TabOption[],

    // Tabs
    defaultTabIndex?: number,
    children?: ReactNode | ReactNode[],
    overviewBanner?: ReactNode
};

/**
 * The page of an enhancement in the settings. Appears when clicking on an enhancement in its settings.
 */
@overlayProvider(["DeleteConfirmationOverlay"])
export default abstract class EnhancementPage<T extends AnyEnhancement> extends React.Component<Props<T>, { enabled: boolean | number, overviewBannerProps?: BannerWithButton }> {
    // Class functions with proper `this` to not rebind every time
    private _onToggleBinded: () => Promise<void>;
    private _onDeleteBinded: () => Promise<void>;
    private _openDirectory: () => Promise<void>;

    // From decorators
    protected DeleteConfirmationOverlay: ProvidedOverlay<"DeleteConfirmationOverlay">;

    private static defaultTabs: TabOption[] = [ { name: "Description" } ];

    constructor(props: Props<T>, context?: any) {
        super(props, context);

        this.state = {
            enabled: ~window.ReGuilded.themes.enabled.indexOf(this.props.enhancement.id)
        };
        this._onToggleBinded = this._onToggle.bind(this);
        this._onDeleteBinded = this._onDelete.bind(this);
        this._openDirectory = window.ReGuildedConfig.openItem.bind(null, this.props.enhancement.dirname);
    }
    /**
     * Toggles the enhancement's enabled state.
     * @param enabled The new enhancement state
     */
    private async _onToggle(): Promise<void> {
        await this.props.enhancementHandler[this.state.enabled ? "savedUnload" : "savedLoad"](this.props.enhancement)
            .then(() => this.setState({ enabled: !this.state.enabled }));
    }
    /**
     * Confirms whether the enhancement should be deleted and deletes it if the modal is confirmed.
     */
    private async _onDelete(): Promise<void> {
        await this.DeleteConfirmationOverlay.Open({ name: this.props.type })
            .then(async ({ confirmed }) => confirmed && await this.props.enhancementHandler.delete(this.props.enhancement))
            // To not stay in the screen and break something
            .then(() => this.props.switchTab("list", { enhancement: {} }));
    }
    /**
     * Renders additional content for the enhancement.
     * @param enhancement The current enhancement
     * @returns Additional content
     */
    protected abstract renderTabs(enhancement: T): ReactElement | ReactElement[];
    /**
     * Returns the action form component depending on the state.
     * @returns Form element
     */
    private renderActionForm(): ReactElement {
        const [toggleButtonType, toggleButtonText] = this.state.enabled ? ["delete", "Disable"] : ["success", "Enable"],
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
                                buttonText: toggleButtonText,

                                buttonType: toggleButtonType,
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
        const {
            props: {
                iconName,

                switchTab,
                enhancement,

                overviewBanner,

                // Tabs
                children,
                defaultTabIndex,
                tabOptions
            }
        } = this;

        return (
            <ErrorBoundary>
                <div className="ReGuildedEnhancementPage-wrapper">
                    <ScreenHeader iconName={iconName} name={enhancement.name} isBackLinkVisible onBackClick={() => switchTab("list", { enhancement: {} })} />

                    <div className="ReGuildedEnhancementPage-container">
                        {/* Short Description */}
                        <GuildedText block type="subheading" className="ReGuildedEnhancementPage-subtitle">{ enhancement.subtitle || "No subtitle provided." }</GuildedText>
                        {/* Preview images carousel */}
                        { enhancement.images && window.ReGuilded.settingsHandler.config.loadImages &&
                            <PreviewCarousel enhancementId={enhancement.id} enhancementHandler={this.props.enhancementHandler} />
                        }
                        <HorizontalTabs type="compact" renderAllChildren={false} tabSpecs={{ TabOptions: EnhancementPage.defaultTabs.concat(tabOptions) }} defaultSelectedTabIndex={defaultTabIndex}>
                            <div className="ReGuildedEnhancementPage-tab">
                                <ErrorBoundary>
                                    { overviewBanner }
                                    {/* Long description */}
                                    { enhancement.readme
                                        ? <MarkdownRenderer plainText={enhancement.readme} grammar={WebhookEmbed} />
                                        : <GuildedText block type="subtext">No description has been provided.</GuildedText> }
                                    {/* Buttons */}
                                    { this.renderActionForm() }
                                </ErrorBoundary>
                            </div>
                            { children }
                        </HorizontalTabs>
                    </div>
                </div>
            </ErrorBoundary>
        )
    }
}