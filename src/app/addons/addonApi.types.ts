import { AnyComponent } from "../guilded/common";
import { MenuSectionSpecs } from "../guilded/menu";
import { EditorPlugin } from "../guilded/slate";
import { AddonPermission } from "./addonPermission";

type DefaultInsertPluginNames = "media" | "form";

export declare interface SlateUtil {
    defaultInsertPlugins: Record<DefaultInsertPluginNames, number>;
    addInsertPlugin(plugin: EditorPlugin): number;
    removeInsertPlugin(index: number): EditorPlugin;
    addSlateSection(section: MenuSectionSpecs): void;
    removeSlateSection(name: string): void;
    getPluginByType(name: DefaultInsertPluginNames | string): EditorPlugin;
}

export declare interface ModalUtil {
    // App/user
    addUserSettingsTab(label: string, Component: AnyComponent): number;
    removeUserSettingsTab(index: number): void;

    // Team/server/guild
    addServerSettingsTab(label: string, Component: AnyComponent): number;
    removeServerSettingsTab(index: number): void;
}

export declare interface AddonInfo {
    version: string;
    dirname: string;
    receivedPermissions: AddonPermission;
}
