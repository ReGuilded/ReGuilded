//import SettingsInjector from "../core/settings/index.jsx";

export default async function addonPreInit(addonApi) {
    window.React = addonApi.React;
    window.ReactDOM = addonApi.ReactDOM;

    // Disable sentries
    try {
        window.__SENTRY__.hub.getClient().close(0);
        window.__SENTRY__.logger.disable();
    } catch (e) {
        console.error("ReGuilded Addon SDK", "Failed to disable sentries!", e);
    }

    await import("../core/settings/settings").then(
        async ({ default: SettingsInjector }) => await (window.settingsInjector = new SettingsInjector()).init()
    );
}
