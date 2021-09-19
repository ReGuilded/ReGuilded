// @ts-ignore
import patcher from "./patcher";

export const modules: Array<{ exports: any, i: number, l: boolean }> = Object.values(window.webpackRequire.c);

// Module getters
export function findModule(filter: (module: any) => boolean): any | void {
    return modules.find(module => filter(module?.exports))?.exports;
}

export function findAllModules(filter: (module: any) => boolean): Array<any> {
    return modules.filter(module => filter(module?.exports)).map(m => m?.exports);
}

export function findByProps(...props: string[]): any | void {
    return findModule(module => module && props.every(prop => module.hasOwnProperty(prop)));
}

export function findAllByProps(...props: string[]): Array<any> {
    return findAllModules(module => module && props.every(prop => module.hasOwnProperty(prop)));
}

export function findByString(...strings: string[]): any | void {
    return findModule(module => module && strings.every(string => typeof(module) === "function" && ~module.toString().indexOf(string)));
}

// Standard, common modules
export const React: any = findByProps("createElement", "__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED");
export const ReactDOM: any = findByProps("findDOMNode", "unmountComponentAtNode", "__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED");

// Disable sentries
try {
    window.__SENTRY__.hub.getClient().close(0);
    window.__SENTRY__.logger.disable();
}
catch (e) {
    console.error("ReGuilded Addon SDK", "Failed to disable sentries!", e);
}

// Tools
export function waitForElement(selector: string): Promise<Node | Element> {
    return new Promise<Node | Element>(resolve => {
        const node: Node | Element = document.querySelector(selector);
        if (node)
            return node;

        const observer: MutationObserver = new MutationObserver(() => {
            const node: Node | Element = document.querySelector(selector);
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

export function patchElementRenderer(
    selector: string,
    id: string,
    patchType: "before" | "after" | "instead",
    callback: (thisObject: any, methodArguments: IArguments, returnValue: any) => any
): Promise<[Node, React.ReactElement]> {
    return new Promise<[Node, React.ReactElement]>(async resolve => {
        const node: Node = await waitForElement(selector);
        const instance: React.ReactElement = getOwnerInstance(node);

        for (const component of [instance.constructor.prototype, instance])
            patcher[patchType](id, component, "render", callback);

        instance.forceUpdate();
        resolve([node, instance]);
    });
}

export function getOwnerInstance(element: Element | Node): any {
    if (!element)
        return null;
    
    let reactInstance: any = element[Object.keys(element).find(key => ~key.indexOf("__reactInternalInstance"))];
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