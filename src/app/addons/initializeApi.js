require("./baseAddon.js");

module.exports = function addonPreInit(addonApi) {
    global.React = window.React = addonApi.React;
    global.ReactDOM = window.ReactDOM = addonApi.ReactDOM;

    // Disable sentries
    try {
        window.__SENTRY__.hub.getClient().close(0);
        window.__SENTRY__.logger.disable();
    }
    catch (e) {
        console.error("ReGuilded Addon SDK", "Failed to disable sentries!", e);
    }

    require("../core/settings/index.jsx");
}