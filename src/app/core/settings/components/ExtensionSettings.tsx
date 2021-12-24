import ErrorBoundary from "./ErrorBoundary.jsx";
import ExtensionItem from "./ExtensionItem.js";
import { ChildTabProps } from "./TabbedSettings";
const { shell } = require("electron");

const { React, NullState } = window.ReGuildedApi;

export default class ExtensionSettings extends React.Component<ChildTabProps, { dirname: string, all: object[] }> {
    protected type: string;
    protected ItemTemplate: any; // TODO: Change this to typeof ExtensionItem child

    constructor(props: ChildTabProps, context?: any) {
        super(props, context);
    }
    render() {
        const { type, ItemTemplate, state: { dirname, all }, props: { switchTab } } = this;

        return (
            <ErrorBoundary>
                <div className="OptionsMenuPageWrapper-container">
                    <div className="TeamDocs-container ReGuildedExtensions-container DocChannel-team-docs ContentLoader-container ContentLoader-container-vertically-centered" style={{paddingLeft: "32px", paddingRight: "32px"}}>
                        <div className="TeamDocs-container-wrapper ReGuiledExtensions-wrapper">
                            { all.length ?
                                <div className="DocDisplayV2-container TeamDocs-all-docs-display ReGuildedExtensions-grid">
                                    <div className="DocsGrid-container">
                                        <div className="DocsGrid-grid InfiniteScrollList-container">
                                            { all.map(ext => <ItemTemplate {...ext} switchTab={switchTab}/>) }
                                        </div>
                                    </div>
                                </div>
                            :
                                // buttonText="" onClick={e => ...}
                                <NullState type="nothing-here" title={"There are no " + type + "s installed"} subtitle={"You have not installed any ReGuilded " + type + "s yet. To install it, put it in the " + type + "s folder."} buttonText="Open folder" onClick={() => shell.openItem(dirname)} alignment="center"/>
                            }
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        );
    }
}