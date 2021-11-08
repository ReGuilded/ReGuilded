import { shell } from 'electron';
import ErrorBoundary from './ErrorBoundary';

const { OverflowButton, GuildedForm, UserBasicInfo, UserModelHelper, React } = ReGuildedApi;

export default class ExtensionItem extends React.Component {
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
                            label: "Edit source",
                            icon: "icon-edit",
                            onClick: () => shell.openItem(this.state?.fp)
                        },
                        {
                            label: "Open directory",
                            icon: "icon-team-stream-popout",
                            onClick: () => shell.openItem(this.state?.dirname)
                        }
                    ]
                }
            ]
        };
    }
    onToggle() {}
    render() {
        const { id, name, readme, type, publisher } = this.props,
              toggleCallback = this.onToggle.bind(this),
              { overflowMenuSpecs } = this,
              { enabled } = this.state;

        return (
            <a className="DocDisplayItem-wrapper ReGuildedExtension-wrapper">
                <div className={"DocDisplayItem-container DocDisplayItem-container-desktop DocDisplayItem-container-aspect-ratio ReGuildedExtension-container ReGuildedExtension-" + type + (enabled ? " Enabled" : " Disabled")}>
                    <div className="AspectRatioContainer-container ReGuildedExtension-aspect-ratio" style={{ 'padding-bottom': '90.9091%' }}>
                        <div className="DocDisplayItem-preview-summary ReGuildedExtension-preview-summary">
                            {/* Description */}
                            <div className="DocDisplayItem-preview ReGuildedExtension-preview">
                                <p className="ReGuildedExtension-description">
                                    {readme?.length ? ReGuildedApi.renderMarkdown(readme) : "No description provided."}
                                </p>
                            </div>
                            {/* Footer */}
                            <div className="DocDisplayItem-summary-info DocSummaryInfo-container ReGuildedExtension-summary-info">
                                <GuildedForm onChange={e => e.hasChanged ? toggleCallback(e.values.extensionToggle) : null} formSpecs={{
                                    sections: [
                                        {
                                            fieldSpecs: [
                                                {
                                                    type: "Switch",
                                                    label: name,
                                                    fieldName: "extensionToggle",
                                                    description: `Id - ${id}`,
                                                    layout: "space-between",
                                                    defaultValue: enabled
                                                }
                                            ]
                                        }
                                    ],
                                }}/>
                                {/* TODO: Fix the publisher not being fetched if the publisher isn't viewing user */}
                                {/*
                                <br/>
                                { publisher
                                    ? <UserBasicInfo size="sm" user={UserModelHelper?.GetModel(publisher)}/>
                                    : Unknown publisher
                                } */}
                                <h6>Unknown publisher</h6>
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