declare interface SimpleToggle {
    onChange: (state: boolean) => void,
    defaultValue?: boolean,
    isDisabled?: boolean,
    label?: string
}

const _: (props: SimpleToggle) => React.Component = ReGuilded.webpackManager.withClassProperty("input")[0]?.exports?.default;
export default _;