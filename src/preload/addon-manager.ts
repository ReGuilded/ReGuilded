import ExtensionManager from "./extension-manager";
import { Addon } from "../common/extensions";

// TODO: Checking
export default class AddonManager extends ExtensionManager<Addon> {
    constructor(dirname: string) {
        super(dirname);

        this.exportable.load = function load(addonId: string) {};
        this.exportable.unload = function unload(addonId: string) {};
    }
    protected override onFileChange(_: Addon) {
        // TODO: Unload & load add-on
        return new Promise<void>(resolve => resolve());
    }
}
