/**
 * Adds additional props to React Component.
 * @param additional The properties to add
 * @returns Modified Type
 */
export function modifyProps<P extends {}>(additional: P) {
    // Get around TypeScript non-sense
    return function modifyProps<T extends new (...args: any[]) => any>(Base: T): T {
        return class WithModifiedProps extends Base {
            constructor(...args: any[]) {
                const [props, ...other] = args;
                super({ ...props, ...additional }, ...other);
            }
        };
    };
}
