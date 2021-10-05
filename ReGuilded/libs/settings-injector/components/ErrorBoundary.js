export default class ErrorBoundary extends React.Component {
    componentDidCatch(error) {
        console.log('ErrorBoundary catch error')
        console.error(error);
    }
    
    render() {
        console.log('ErrorBoundary render')
        return this.props.children;
    }
}