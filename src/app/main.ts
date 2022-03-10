import { members } from "./core/badges-flairs";
import ReGuilded from "./core/ReGuilded";
import webpackPush from "./webpackInject";

window.ReGuilded = new ReGuilded();

function setPush(obj) {
    Object.defineProperty(window.webpackJsonp, "push", obj);
}

let hasInjected = false;
function setUpWebpackInjection() {
    // To wait for the bundle to be created
    if (document.readyState == "interactive" && window.bundle)
        // Wait when bundle loads
        window.bundle.addEventListener("load", injectWebpackJsonp);
    // Still try injecting even if it was too late
    else if (!hasInjected && document.readyState == "complete" && window.webpackJsonp) {
        console.warn(
            "WebpackJsonp injection is too late. Still injecting. This may require loading a bundle that has not been loaded yet. If ReGuilded hasn't loaded yet, make sure to load settings or area that you have not yet viewed or refresh Guilded."
        );
        injectWebpackJsonp();
    }
}
function injectWebpackJsonp() {
    hasInjected = true;

    // Saves the old push
    window.webpackJsonp._push = window.webpackJsonp.push;

    setPush({
        get: () => webpackPush.bind(window.webpackJsonp),
        set: value => setPush({ get: () => value })
    });
}

// Inject if it's possible yet, or wait for it to be possible
if (document.readyState != "loading") setUpWebpackInjection();
else document.addEventListener("readystatechange", setUpWebpackInjection);

// Fetch ReGuilded things
(async () => {
    // Global badge holders
    await fetch("https://raw.githubusercontent.com/ReGuilded/ReGuilded-Website/main/ReGuilded/wwwroot/contributorIds.json")
        .then(
            response => response.json(),
            e => console.warn("Failed to fetch ReGuilded badges:", e)
        )
        .then(
            json => {
                members.dev = json.dev;
                members.contrib = json.contrib;
            },
            e => console.warn("Failed to fetch ReGuilded badges:", e)
        );
})();
