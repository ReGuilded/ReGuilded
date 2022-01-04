import { members } from "./core/badges-flairs";

//import { ipcRenderer } from "electron";

// const preload = ipcRenderer.sendSync("REGUILDED_GET_PRELOAD");
// if (preload) {
//     require(preload);
// }

// Fetch ReGuilded things
(async () => {
    // Global badge holders
    await fetch("https://raw.githubusercontent.com/ReGuilded/ReGuilded-Website/main/ReGuilded/wwwroot/contributors.json")
        .then(
            response => response.json(),
            e => console.warn("Failed to fetch ReGuilded badges:", e)
        )
        .then(
            json => {
                members.dev = json.filter(user => user.isCoreDeveloper)
                members.contrib = json.filter(user => user.isContributor)
            },
            e => console.warn("Failed to fetch ReGuilded badges:", e)
        );
});