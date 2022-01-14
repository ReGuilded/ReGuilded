import { ipcRenderer } from "electron";

const preload = ipcRenderer.send("reguilded-preload");

console.log("Preload Splash");

document.body.appendChild(Object.assign(document.createElement("div"), { innerHTML: "This is splash" }));

if (preload) {
    require(preload);
}
