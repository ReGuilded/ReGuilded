import { members } from "./core/badges-flairs";
import ReGuilded from "./core/ReGuilded";
import webpackPush from "./webpackInject";

//import { ipcRenderer } from "electron";

// const preload = ipcRenderer.sendSync("REGUILDED_GET_PRELOAD");
// if (preload) {
//     require(preload);
// }

window.ReGuilded = new ReGuilded();

function setPush(obj) {
    Object.defineProperty(window.webpackJsonp, "push", obj);
}

document.addEventListener("readystatechange", () => {
    // To wait for the bundle to be created
    if (document.readyState === "interactive")
        // Wait when bundle loads
        window.bundle.addEventListener("load", () => {
            // Saves the old push
            window.webpackJsonp._push = window.webpackJsonp.push;

            setPush({
                get: () => webpackPush.bind(window.webpackJsonp),
                set: value => setPush({ get: () => value })
            });
        });
});

// Fetch ReGuilded things
(async() => {
    // Global badge holders
    await fetch(
        "https://raw.githubusercontent.com/ReGuilded/ReGuilded-Website/main/ReGuilded/wwwroot/contributors.json"
    )
        .then(
            response => response.json(),
            e => console.warn("Failed to fetch ReGuilded badges:", e)
        )
        .then(
            json => {
                members.dev = json.filter(user => user.isCoreDeveloper);
                members.contrib = json.filter(user => user.isContributor);
            },
            e => console.warn("Failed to fetch ReGuilded badges:", e)
        );
})();
