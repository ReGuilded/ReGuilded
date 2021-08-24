import * as lib from "./lib";
import patcher from "./patcher";
import ModalStack from "./modalStack";
import * as SettingsFields from "./settingsFields";
import "./baseAddon";

ReGuilded.addonLib = {
    ...lib,
    patcher, ModalStack, SettingsFields
};

ModalStack.init();