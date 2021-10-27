import ErrorBoundary from './ErrorBoundary.jsx';

export default function ExtensionSettings({ type, children }) {
    return (
        <ErrorBoundary>
            <div className="OptionsMenuPageWrapper-container">
                <div className="TeamDocs-container ReGuildedExtensions-container DocChannel-team-docs ContentLoader-container ContentLoader-container-vertically-centered" style={{"padding-left": "32px"}}>
                    <div className={"TeamDocs-container-wrapper ReGuiledExtensions-wrapper ReGuildedExtensions-wrapper-" + type}>
                        { children }
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}