import _React from "react";

const { React, NullState } = window.ReGuildedApi;

export default class ErrorBoundary extends React.Component<{ }, { hasErrored: boolean, error: Error | null }> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            hasErrored: false,
            error: null
        };
    }
    componentDidCatch(error) {
        console.error(error);
        console.warn('Catched error in', this.props.children)
        this.setState({
            hasErrored: true,
            error
        });
    }
    render() {
        return this.state.hasErrored
            ? (
                <NullState
                    title="ReGuilded Error Occurred"
                    type="error"
                    subtitle="Something in ReGuilded has broke. Be sure to report this error by submitting it as an issue in our GitHub repository."
                    buttonText="Create issue" onClick={() => window.ReGuildedConfig.openExternal(`https://github.com/ReGuilded/ReGuilded/issues/new?labels=bug&title=${this.state.error.name}+${this.state.error.message.replace(/ /g, "+")}`)}/>
            )
            : this.props.children
    }
}