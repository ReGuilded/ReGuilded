const { React } = window.ReGuildedApi;

type Props = {
    tabs: {
        [tabName: string]: typeof React.Component
    },
    defaultTab: string,
    tabProps?: object
}
export type ChildTabProps = {
    parent: TabbedSettings,
} & object;

/**
 * Allows settings to be changed between tabs.
 */
export default class TabbedSettings extends React.Component<Props> {
    constructor(props: Props, context?: any) {
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
        const { props: { tabs }, state: { currentTab, tabProps }, switchTab } = this;
        const CurrentTab = tabs[currentTab];

        return (
            <CurrentTab {...tabProps} switchTab={switchTab} />
        );
    }
}