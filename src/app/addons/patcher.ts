import { UnknownFunction } from "../types/util";

export type PatchChild = {
    caller: string;
    type: "after" | "before" | "instead";
    id: number;
    callback: (thisObject: unknown, methodArguments: unknown[], returnValue: unknown) => unknown;
    unpatch: () => void;
};

export type PatchData = {
    caller: string;
    module: unknown;
    functionName: string;
    originalFunction: UnknownFunction;
    unpatch: () => void;
    count: number;
    children: PatchChild[];
};

type PatcherCallback = (thisObject: unknown, methodArguments: unknown[], returnValue: unknown) => unknown;

export default new (class Patcher {
    _patches: PatchData[] = [];
    after: (caller: string, module: unknown, functionName: string, callback: PatcherCallback) => () => void;
    before: (caller: string, module: unknown, functionName: string, callback: PatcherCallback) => () => void;
    instead: (caller: string, module: unknown, functionName: string, callback: PatcherCallback) => () => void;

    constructor() {
        this.after = (caller: string, module: unknown, functionName: string, callback: PatcherCallback) => this.doPatch(caller, module, functionName, callback, "after");
        this.before = (caller: string, module: unknown, functionName: string, callback: PatcherCallback) => this.doPatch(caller, module, functionName, callback, "before");
        this.instead = (caller: string, module: unknown, functionName: string, callback: PatcherCallback) => this.doPatch(caller, module, functionName, callback, "instead");
    }

    getPatchesByCaller(caller: string): PatchChild[] {
        if (!caller) return [];

        const patches: PatchChild[] = [];
        for (const patch of this._patches) for (const childPatch of patch.children) if (childPatch.caller === caller) patches.push(childPatch);

        return patches;
    }

    unpatchAll(caller: string): void {
        const patches: PatchChild[] = this.getPatchesByCaller(caller);
        if (!patches.length) return;

        for (const patch of patches) patch.unpatch();
    }

    makeOverride(patch: PatchData, ...args: unknown[]): UnknownFunction {
        const allArgs = [patch, ...args];

        return function () {
            if (!patch?.children?.length) return patch.originalFunction.apply(this, allArgs);

            let returnValue: unknown;
            const call = (childPatch: PatchChild, args: unknown[], type: string) => {
                try {
                    const tempReturn: unknown = childPatch.callback(this, args, patch.originalFunction.bind(this));
                    if (tempReturn !== undefined) returnValue = tempReturn;
                } catch (err) {
                    console.error("Patch:" + patch.functionName, "Type:" + type, err);
                }
            };

            for (const beforePatch of patch.children.filter((e) => e.type === "before")) call(beforePatch, allArgs, "before");

            const insteadPatches: PatchChild[] = patch.children.filter((e) => e.type === "instead");
            if (!insteadPatches.length) returnValue = patch.originalFunction.apply(this, allArgs);
            else for (const insteadPatch of insteadPatches) call(insteadPatch, allArgs, "instead");

            for (const afterPatch of patch.children.filter((e) => e.type === "after")) call(afterPatch, allArgs, "after");

            return returnValue;
        };
    }

    pushPatcher(caller: string, module: unknown, functionName: string) {
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
        module: unknown,
        functionName: string,
        callback: (thisObject: unknown, methodArguments: unknown[], returnValue: unknown) => unknown,
        type: "after" | "before" | "instead" = "after",
        options: { force: boolean } = { force: false }
    ): () => void {
        const patch: PatchData = this._patches.find((e) => e.module === module && e.functionName === functionName) ?? this.pushPatcher(caller, module, functionName);

        const child = {
            caller,
            type,
            id: patch.count,
            callback,
            unpatch: () => {
                patch.children.splice(
                    patch.children.findIndex((childPatch) => childPatch.id === child.id && childPatch.type === child.type),
                    1
                );

                if (patch.children.length <= 0) {
                    const index = this._patches.findIndex((p) => p.module === module && p.functionName === functionName);
                    this._patches[index].unpatch();
                    this._patches.splice(index, 1);
                }
            }
        };

        patch.children.push(child);
        patch.count++;

        return child.unpatch;
    }
})();
