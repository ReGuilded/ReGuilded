import styles from "./modalStack.scss";
import {React} from "./lib";

type ModalStackState = {
    stack: Array<any>;
    closing: Array<any>;
};

export default class ModalStack extends React.Component<null, ModalStackState> {
    state: ModalStackState = {
        stack: [],
        closing: []
    };
    
    // Our component singleton instance
    static instance: ModalStack;
    
    // Our container properties, used to store the React modal component
    static container: Element;
    static containerId: string = "ReGuildedModalStackContainer";
    // Initialize and mount our component
    static init(): void {
        // Create the container and assign its ID
        this.container = Object.assign(document.createElement("div"), {
            id: this.containerId
        });
        
        // Append the container and inject the SCSS
        document.body.appendChild(this.container);
        styles.inject();
        
        // Render the component to the document
        ReactDOM.render(<ModalStack/>, this.container);
    }
    
    // A push method, to push modals to the stack
    static push(modal: any): void {
        this.instance.setState({ stack: [...this.instance.state.stack, modal] });
    }
    
    // A pop method, to close the last modal in the stack
    static async pop(): Promise<void> {
        // Destructure our instance's state
        const { stack, closing } = this.instance.state;
        const modal = stack[stack.length - 1];
        
        // If there is nothing to close, return
        if (!stack.length || !modal)
            return;
        
        // Push our closing state, to activate the transition
        this.instance.setState({ closing: [...closing, modal] });
        
        // Wait for the transition
        await new Promise(r => setTimeout(r, 250));
        
        // Remove the modal from the stack and closing stack
        // Note - using the original instance instead of the destructured is important
        this.instance.setState({
            stack: this.instance.state.stack.filter(m => m !== modal),
            closing: this.instance.state.closing.filter(m => m !== modal)
        });
    }
    
    // Assign our instance
    componentDidMount(): void {
        ModalStack.instance = this;
    }
    
    // Handle the backdrop click, to close the last modal
    handleBackDropClick(e: MouseEvent): void {
        // Ensure it's actually the backdrop and not a child
        if (e.target !== e.currentTarget)
            return;
        
        // K I L L
        ModalStack.pop();
    }

    // Render the stack
    render(): React.Component {
        const { stack, closing } = this.state;
        
        return (
            <div className={"ModalStack" + (stack.length > closing.length ? " Active" : "")}>
                { stack.map((modal, id) => (
                    <div className={"ModalContainer" + (~closing.indexOf(modal) || id < stack.length - 1 ? " Closing" : "")} key={id}
                         onMouseDown={this.handleBackDropClick.bind(this)}
                         style={{ zIndex: id * 10 }}>
                        { modal }
                    </div>
                )) }
            </div>
        );
    }
}