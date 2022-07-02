const React = window.ReGuilded.getApiProperty("react");

type Props = {
    tabs: {
        [tabName: string]: typeof React.Component;
    };
    defaultTab: string;
    tabProps?: object;
};
type State = {
    currentTab: string;
    tabProps: object;
};
export type SwitchTab = (tabName: string, tabProps: object) => void;
export type PagedSettingsChildProps = {
    switchTab: SwitchTab;
    [tabProp: string]: unknown;
};

/**
 * Allows settings to have multiple settings that can be switched to.
 */
export default class PagedSettings extends React.Component<Props, State> {
    private switchTab: SwitchTab;
    constructor(props: Props, context?: unknown) {
        super(props, context);

        // For tab switching
        this.state = {
            currentTab: props.defaultTab,
            tabProps: props.tabProps ?? {}
        };
        // TODO: Context
        this.switchTab = this.goto.bind(this);
    }
    /**
     * Switches to the given tab.
     * @param tabName The name of the tab to switch to
     * @param tabProps The properties of the switched tab
     */
    goto(tabName: string, tabProps: object) {
        this.setState(() => ({ currentTab: tabName, tabProps }));
    }
    render() {
        const {
            props: { tabs },
            state: { currentTab, tabProps },
            switchTab
        } = this;
        const CurrentTab = tabs[currentTab];

        return <CurrentTab {...tabProps} switchTab={switchTab} />;
    }
}
