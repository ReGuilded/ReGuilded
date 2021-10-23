import ErrorBoundary from './ErrorBoundary';

export default function ExtensionGrid({ type, children }) {
    return (
        <ErrorBoundary>

        <div className={"DocDisplayV2-container TeamDocs-all-docs-display ReGuildedExtensions-grid ReGuildedExtensions-grid-" + type}>
            <div className="DocsGrid-container">
                <div className="DocsGrid-grid InfiniteScrollList-container">
                    { children }
                </div>
            </div>
        </div>
        </ErrorBoundary>
    );
}