import ErrorBoundary from './ErrorBoundary.jsx';

const { React, NullState } = ReGuildedApi;

export default class ExtensionSettings extends React.Component {
    constructor(...args) {
        super(...args);
    }
    render() {
        const { ItemTemplate, nullTitle, nullSubtitle } = this,
              { all } = this.state;

        return (
            <ErrorBoundary>
                <div className="OptionsMenuPageWrapper-container">
                    <div className="TeamDocs-container ReGuildedExtensions-container DocChannel-team-docs ContentLoader-container ContentLoader-container-vertically-centered" style={{"padding-left": "32px"}}>
                        <div className="TeamDocs-container-wrapper ReGuiledExtensions-wrapper">
                            { all.length ?
                                <div className="DocDisplayV2-container TeamDocs-all-docs-display ReGuildedExtensions-grid">
                                    <div className="DocsGrid-container">
                                        <div className="DocsGrid-grid InfiniteScrollList-container">
                                            { all.map(ext => <ItemTemplate {...ext}/>) }
                                        </div>
                                    </div>
                                </div>
                            :
                                // buttonText="" onClick={e => ...}
                                <NullState type="nothing-here" title={nullTitle} subtitle={nullSubtitle} alignment="center"/>
                            }
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        );
    }
}