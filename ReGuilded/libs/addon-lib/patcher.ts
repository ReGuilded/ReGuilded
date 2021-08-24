export type PatchChild = {
    caller: string;
    type: "after" | "before" | "instead";
    id: number;
    callback: (thisObject: any, methodArguments: IArguments, returnValue: any) => any;
    unpatch: () => void;
};

export type PatchData = {
    caller: string;
    module: any;
    functionName: string;
    originalFunction: Function;
    unpatch: () => void;
    count: number;
    children: PatchChild[];
};

export default new class Patcher {
    _patches: PatchData[] = [];
    
    getPatchesByCaller(caller: string): PatchChild[] {
        if (!caller) return [];
        
        const patches: PatchChild[] = [];
        for (const patch of this._patches)
            for (const childPatch of patch.children)
                if (childPatch.caller === caller)
                    patches.push(childPatch);
                
        return patches;
    }
    
    unpatchAll(caller: string): void {
        const patches: PatchChild[] = this.getPatchesByCaller(caller);
        if (!patches.length) return;
        
        for (const patch of patches)
            patch.unpatch();
    }
    
    makeOverride(patch: PatchData): Function {
        return function() {
            if (!patch?.children?.length)
                return patch.originalFunction.apply(this, arguments);

            let returnValue: any;
            const call = (childPatch: PatchChild, args: IArguments, type: string) => {
                try {
                    const tempReturn: any = childPatch.callback(this, args, patch.originalFunction.bind(this));
                    if (tempReturn !== undefined) returnValue = tempReturn;
                }
                catch (err) {
                    console.error("Patch:" + patch.functionName, "Type:" + type, err);
                }
            };
            
            for (const beforePatch of patch.children.filter(e => e.type === "before"))
                call(beforePatch, arguments, "before");
            
            const insteadPatches: PatchChild[] = patch.children.filter(e => e.type === "instead");
            if (!insteadPatches.length) returnValue = patch.originalFunction.apply(this, arguments);
            else for (const insteadPatch of insteadPatches)
                call(insteadPatch, arguments, "instead");
            
            for (const afterPatch of patch.children.filter(e => e.type === "after"))
                call(afterPatch, arguments, "after");
            
            return returnValue;
        };
    }
    
    pushPatcher(caller: string, module: any, functionName: string) {
        const patch: PatchData = {
            caller,
            module,
            functionName,
            originalFunction: module[functionName],
            unpatch: () => {
                patch.module[patch.functionName] = patch.originalFunction;
                patch.children = [];
            },
            count: 0,
            children: []
        };
        
        module[functionName] = this.makeOverride(patch);
        return this._patches.push(patch), patch;
    }
    
    doPatch(
        caller: string,
        module: any,
        functionName: string,
        callback: (thisObject: any, methodArguments: IArguments, returnValue: any) => any,
        type: ("after" | "before" | "instead") = "after",
        options: { force: boolean } = { force: false }
    ): () => void {
        const patch: PatchData = this._patches.find(e => e.module === module && e.functionName === functionName) ?? this.pushPatcher(caller, module, functionName);
        
        const child = {
            caller,
            type,
            id: patch.count,
            callback,
            unpatch: () => {
                patch.children.splice(patch.children.findIndex(childPatch => childPatch.id === child.id && childPatch.type === child.type), 1);
                
                if (patch.children.length <= 0) {
                    const index = this._patches.findIndex(p => p.module === module && p.functionName === functionName);
                    this._patches[index].unpatch();
                    this._patches.splice(index, 1);
                }
            }
        };
        
        patch.children.push(child);
        patch.count++;
        
        return child.unpatch;
    }
    
    before(caller: string, module: any, functionName: any, callback: (thisObject: any, methodArguments: IArguments, returnValue: any) => any): () => void {
        return this.doPatch(caller, module, functionName, callback, "before");
    }

    after(caller: string, module: any, functionName: any, callback: (thisObject: any, methodArguments: IArguments, returnValue: any) => any): () => void {
        return this.doPatch(caller, module, functionName, callback, "after");
    }

    instead(caller: string, module: any, functionName: any, callback: (thisObject: any, methodArguments: IArguments, returnValue: any) => any): () => void {
        return this.doPatch(caller, module, functionName, callback, "instead");
    }
};