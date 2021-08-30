/**
 * Event handler for click event on switch.
 * @param e Event args received from click event
 * @param self The component that uses this function
 */
function onClick(ev: MouseEvent, self: ToggleField): void {
    // Get SwitchInput-tab parent(SwitchInput-slide)
    const base: Element = (ev.fromElement || ev.toElement || ev.nativeEvent.fromElement || ev.nativeEvent.toElement)
    const element: Element = base.classList.contains("SwitchInput-tab") ? base.parentElement : base
    console.log('Event', ev)
    console.log('Caller', element)
    // Toggle
    self.state.enabled = !self.state.enabled
    // Decides whether to remove or add the class
    //const fn = self.state.enabled ? element.classList.add : element.classList.remove;
    
    // Adds or removes the class
    //fn("SwitchInput-container-on"); // Illegal invocation
    if(self.state.enabled)
        element.classList.add("SwitchInput-container-on");
    else
        element.classList.remove("SwitchInput-container-on");
    // Calls given argument
    self.onToggle.bind(self)(ev, self.state.enabled);
}

/**
 * Field that has switch that can be toggled.
 */
export default class ToggleField extends React.Component {
    state: { enabled: boolean }
    onToggle: (event: MouseEvent, enabled: boolean) => void
    /**
     * Creates new instance of ToggleField component
     * @param props Attribute properties from JSX
     */
    constructor(props: { onToggle: (event: MouseEvent, enabled: boolean) => void, toggled: boolean, children? }) {
        super(props);
        this.state = {
            enabled: props.toggled
        };
        this.onToggle = props.onToggle;
    }
    /**
     * Renders ToggleField component.
     * @returns {React.Component} Renderable React object
     */
    render(): React.Component {
        const self = this
        return (
            <div className="ToggleFieldWrapper-container ToggleFieldWrapper-container-layout-space-between">
                {/* Switch label */}
                <div className="ToggleFieldWrapper-label-wrapper">
                    <div className="ToggleFieldWrapper-label">{ this.props.children }</div>
                </div>
                {/* Switch input */}
                <div className={"SwitchInput-container " + (this.state.enabled ? "SwitchInput-container-on" : "")} onClick={function(e: MouseEvent) { onClick.bind(this)(e, self) }}>
                    <div className="SwitchInput-slide">
                        <div className="SwitchInput-tab"></div>
                    </div>
                </div>
            </div>
        )
    }
}