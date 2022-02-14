// @ts-ignore
import patcher from "./patcher";

// Tools
/**
 * Waits for the given element to mutate.
 * @param selector HTML query selector pattern
 */
export function waitForElement(selector: string): Promise<Element | Node> {
    return new Promise(resolve => {
        const node = document.querySelector(selector);
        if (node) return node;

        const observer = new MutationObserver(() => {
            const node = document.querySelector(selector);
            if (!node) return;

            observer.disconnect();
            resolve(node);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
export function patchElementRenderer(
    selector: string,
    id: string,
    patchType: "before" | "after" | "instead",
    callback: (thisObject: any, methodArguments: IArguments, returnValue: any) => any
): Promise<[Node, React.Component]> {
    return new Promise(async resolve => {
        const node = await waitForElement(selector);

        const instance: React.Component | void = getReactInstance(node);
        if (instance) {
            for (const component of [instance.constructor.prototype, instance]) {
                patcher[patchType](id, component, "render", callback);
            }
            instance.forceUpdate();

            resolve([node, instance]);
        }
    });
}
/**
 * Gets the React instance that owns the given element.
 * @param element The element to get owner instance of.
 */
export function getReactInstance(element: Element | Node): React.Component<any, any> | void {
    if (!element) return null;

    let reactInstance = element[Object.keys(element).find(key => ~key.indexOf("__reactInternalInstance"))];
    if (!reactInstance) return;

    let depth = 0;
    while (reactInstance && depth < 1000) {
        reactInstance = reactInstance?.return;
        if (!reactInstance) break;

        if (reactInstance.stateNode?.isReactComponent) return reactInstance.stateNode;
        depth++;
    }
}
window.getReactInstance = getReactInstance;
