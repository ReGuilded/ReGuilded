const React = window.ReGuilded.getApiProperty("react");

export default class Changelog extends React.Component {
    override componentDidMount() {
        // There is no need for "NEW" badge
        window.ReGuilded.stateHandler.update({ lastViewedChangelogVersion: window.ReGuilded.version });
    }
    render() {
        return (
            <div className="OptionsMenuPageWrapper-container">
                Todo
            </div>
        );
    }
}