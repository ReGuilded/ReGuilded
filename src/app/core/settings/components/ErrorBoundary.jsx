module.exports = class ErrorBoundary extends React.Component {
    componentDidCatch(error) {
        console.error(error);
        console.warn('Catched error in', this.props.children)
    }
    render() {
        return this.props.children;
    }
}