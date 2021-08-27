export default class ErrorBoundary extends React.Component {
    componentDidCatch(error) {
        console.error(error);
    }
    
    render() {
        return this.props.children;
    }
}