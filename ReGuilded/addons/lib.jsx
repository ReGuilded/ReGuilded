// @ts-ignore
import patcher from "./patcher.ts";

// Tools
/**
 * Waits for the given element to mutate.
 * @param {string} selector HTML query selector pattern
 * @returns {Promise<Node | Element>}
 */
export function waitForElement(selector) {
    return new Promise(resolve => {
        const node = document.querySelector(selector);
        if (node)
            return node;

        const observer = new MutationObserver(() => {
            const node = document.querySelector(selector);
            if (!node)
                return;

            observer.disconnect();
            resolve(node);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

/**
 * 
 * @param {string} selector HTML query selector pattern
 * @param {string} id 
 * @param {"before" | "after" | "instead"} patchType 
 * @param {(thisObject: any, methodArguments: IArguments, returnValue: any) => any} callback 
 * @returns {Promise<[Node, React.ReactElement]>}
 */
export function patchElementRenderer(selector, id, patchType, callback) {
    return new Promise(async resolve => {
        const node = await waitForElement(selector);
        /** @type {React.ReactElement} */
        const instance = getOwnerInstance(node);

        for (const component of [instance.constructor.prototype, instance])
        {
            patcher[patchType](id, component, "render", callback);
        }
            
        instance.forceUpdate();
        resolve([node, instance]);
    });
}
/**
 * Gets the React instance that owns the given element.
 * @param {Element | Node} element The element to get owner instance of.
 * @returns {any | void}
 */
export function getOwnerInstance(element) {
    if (!element)
        return null;
    
    let reactInstance = element[Object.keys(element).find(key => ~key.indexOf("__reactInternalInstance"))];
    if (!reactInstance)
        return;
    
    let depth = 0;
    while (reactInstance && depth < 1000) {
        reactInstance = reactInstance?.return;
        if (!reactInstance)
            break;
        
        if (reactInstance.stateNode?.isReactComponent)
            return reactInstance.stateNode;
        depth++;
    }
}