const fs = require("fs");
const path = require("path");

module.exports = {
    createDomElement: (type, props, ...children) => {
        const el = Object.assign(document.createElement(type), props);
        children.length && el.append(...children);

        return el;
    },

    getOwnerInstance: (element) => {
        if (!element) return null;
        const reactInstance = element[Object.keys(element).find(e => ~e.indexOf("__reactInternal"))];
        if (!reactInstance) return;
        let current = reactInstance, depth = 1000;

        while (current && depth) {
            current = current?.return;
            if (!current) break;
            if (current.stateNode?.isReactComponent) return current.stateNode;
            depth--;
        }
    },

    findInTree: (tree = {}, filter = _ => _, { ignore = [], walkable = [], maxProperties = 100 } = {}) => {
        let stack = [tree];
        const wrapFilter = function (...args) {
            try {
                return Reflect.apply(filter, this, args);
            }
            catch {
                return false;
            }
        };

        while (stack.length && maxProperties) {
            const node = stack.shift();
            if (wrapFilter(node)) return node;
            if (Array.isArray(node)) stack.push(...node);
            else if (typeof node === "object" && node !== null) {
                if (walkable.length) {
                    for (const key in node) {
                        const value = node[key];
                        if (~walkable.indexOf(key) && !~ignore.indexOf(key)) {
                            stack.push(value);
                        }
                    }
                }
                else {
                    for (const key in node) {
                        const value = node[key];
                        if (node && ~ignore.indexOf(key)) continue;

                        stack.push(value);
                    }
                }
            }
            maxProperties--;
        }
    },

    Patcher: new class Patcher {
        _patches = [];

        getPatchesByCaller(id) {
            if (!id) return [];

            const patches = [];
            for (const patch of this._patches) for (const childPatch of patch.children) if (childPatch.caller === id) patches.push(childPatch);

            return patches;
        }

        unpatchAll(caller) {
            const patches = this.getPatchesByCaller(caller);
            if (!patches.length) return;

            for (const patch of patches) patch.unpatch();
        }

        makeOverride(patch) {
            return function () {
                let returnValue;
                if (!patch?.children?.length) return patch.originalFunction.apply(this, arguments);

                for (const beforePatch of patch.children.filter(e => e.type === "before")) {
                    try {
                        const tempReturn = beforePatch.callback(this, arguments, patch.originalFunction.bind(this));
                        if (tempReturn !== undefined) returnValue = tempReturn;
                    }
                    catch (error) {
                        console.error("Patch:" + patch.functionName, error);
                    }
                }

                const insteadPatches = patch.children.filter(e => e.type === "instead");
                if (!insteadPatches.length) returnValue = patch.originalFunction.apply(this, arguments);

                else for (const insteadPatch of insteadPatches) {
                    try {
                        const tempReturn = insteadPatch.callback(this, arguments, patch.originalFunction.bind(this));
                        if (tempReturn !== undefined) returnValue = tempReturn;
                    }
                    catch (error) {
                        console.error("Patch:" + patch.functionName, error);
                    }
                }

                for (const afterPatch of patch.children.filter(e => e.type === "after")) {
                    try {
                        const tempReturn = afterPatch.callback(this, arguments, returnValue, ret => (returnValue = ret));
                        if (tempReturn !== undefined) returnValue = tempReturn;
                    }
                    catch (error) {
                        console.error("Patch:" + patch.functionName, error);
                    }
                }
                return returnValue;
            }
        }

        pushPatch(caller, module, functionName) {
            const patch = {
                caller,
                module,
                functionName,
                originalFunction: module[functionName],
                undo: () => {
                    patch.module[patch.functionName] = patch.originalFunction;
                    patch.children = [];
                },
                count: 0,
                children: []
            };
            
            module[functionName] = this.makeOverride(patch);
            return this._patches.push(patch), patch;
        }

        doPatch(caller, module, functionName, callback, type = "after", options = {}) {
            // let {displayName} = options;
            const patch = this._patches.find(e => e.module === module && e.functionName === functionName) ?? this.pushPatch(caller, module, functionName);
            // if(typeof(displayName) != "string") displayName || module.displayName || module.name || module.constructor.displayName || module.constructor.name;

            const child = {
                caller,
                type,
                id: patch.count,
                callback,
                unpatch: () => {
                    patch.children.splice(patch.children.findIndex(cpatch => cpatch.id === child.id && cpatch.type === type), 1);
                    if (patch.children.length <= 0) {
                        const patchNum = this._patches.findIndex(p => p.module == module && p.functionName == functionName);
                        this._patches[patchNum].undo();
                        this._patches.splice(patchNum, 1);
                    }
                }
            };
            patch.children.push(child);
            patch.count++;
            return child.unpatch;
        }

        before(caller, module, functionName, callback) {
            return this.doPatch(caller, module, functionName, callback, "before");
        }

        after(caller, module, functionName, callback) {
            return this.doPatch(caller, module, functionName, callback, "after");
        }

        instead(caller, module, functionName, callback) {
            return this.doPatch(caller, module, functionName, callback, "instead");
        }
    },
    
    waitForElement: selector =>
        new Promise(resolve => {
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
        }),
    
    loadStyles: (id, fp) => {
        const data = fs.readFileSync(path.join(__dirname, fp), "utf8");
        const style = module.exports.createDomElement("style", { textContent: data, id: id + "-styles" });
        
        document.head.appendChild(style);
        
        return {
            destroy: () => style.remove(),
            style, data, id
        };
    }
}