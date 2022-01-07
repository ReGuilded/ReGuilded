import { AnyExtension } from "../../../../../common/extensions.js";
import { MenuSpecs } from "../../../../guilded/menu.js";
import ErrorBoundary from "../ErrorBoundary.jsx";
import { SwitchTab } from "../TabbedSettings.jsx";

const { OverflowButton, Form, UserBasicInfo, UserModel, restMethods, React } = window.ReGuildedApi;

type AdditionalProps = {
    type: string,
    switchTab: SwitchTab
};
type State = {
    enabled: boolean | number,
    dirname: string,
    author?: object
};

export default abstract class ExtensionItem<P extends AnyExtension, S = {}> extends React.Component<P & AdditionalProps, State & S> {
    protected overflowMenuSpecs: MenuSpecs;
    private hasToggled: boolean;
    private _onToggleBinded: (enabled: boolean) => Promise<void>;

    constructor(props, context) {
        super(props, context);

        // Can't put it into props because of JavaScript schenanigans
        this.overflowMenuSpecs = {
            id: "ExtensionMenu",
            sections: [
                {
                    name: "Extension",
                    header: "Extension",
                    type: "rows",
                    actions: [
                        {
                            label: "Open directory",
                            icon: "icon-team-stream-popout",
                            onClick: () => window.ReGuildedConfig.openItem(this.state?.dirname)
                        }
                    ]
                }
            ]
        };
        this.hasToggled = false;
        this._onToggleBinded = this.onToggle.bind(this);
    }
    protected abstract onToggle(enabled: boolean): Promise<void>;
    async componentWillMount() {
        if (this.props.author && window.ReGuilded.settingsHandler.settings.loadAuthors) {
            await restMethods.getUserById(this.props.author)
                .then(userInfo => this.setState({author: userInfo.user}))
                .catch(() => {});
        }
    }
    render() {
        const { overflowMenuSpecs, props: { name, readme, version, type, switchTab }, state: { enabled }, _onToggleBinded } = this;

        return (
            <a className="DocDisplayItem-wrapper ReGuildedExtension-wrapper" onClick={() => switchTab("specific", { extension: this.props })}>
                <div className={"DocDisplayItem-container DocDisplayItem-container-desktop DocDisplayItem-container-aspect-ratio ReGuildedExtension-container ReGuildedExtension-" + type + (enabled ? " Enabled" : " Disabled")}>
                    <div className="AspectRatioContainer-container ReGuildedExtension-aspect-ratio" style={{ paddingBottom: '90.9091%' }}>
                        <div className="DocDisplayItem-preview-summary ReGuildedExtension-preview-summary">
                            {/* Description */}
                            <div className="DocDisplayItem-preview ReGuildedExtension-preview">
                                <p className="ReGuildedExtension-description">
                                    {readme?.length ? window.ReGuildedApi.renderMarkdown(readme) : "No description provided."}
                                </p>
                            </div>
                            {/* Footer */}
                            <div className="DocDisplayItem-summary-info DocSummaryInfo-container ReGuildedExtension-summary-info">
                                <div onClick={e => e.stopPropagation()}>
                                    <Form onChange={async ({ hasChanged, values: {enabled} }) => (hasChanged && (this.hasToggled = true) || this.hasToggled) && await _onToggleBinded(enabled)} formSpecs={{
                                        sections: [
                                            {
                                                fieldSpecs: [
                                                    {
                                                        type: "Switch",
                                                        label: name,
                                                        fieldName: "enabled",
                                                        description: version ? `Version ${version}` : "Latest release",
                                                        layout: "space-between",
                                                        defaultValue: enabled
                                                    }
                                                ]
                                            }
                                        ],
                                    }}/>
                                </div>
                                {this.state.author
                                    ? <div><br/><UserBasicInfo size="sm" user={new UserModel(this.state.author)}/></div>
                                    : <div className="DocSummaryInfo-subtitle">{this.props.author ? "By user " + this.props.author : "Unknown author"}</div>
                                }
                            </div>
                            {/* Overflow */}
                            <ErrorBoundary>
                                <OverflowButton className="DocDisplayItem-overflow-icon" menuSpecs={overflowMenuSpecs}/>
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>
            </a>
        );
    }
}