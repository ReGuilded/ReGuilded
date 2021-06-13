const { join } = require("path");
const { exec } = require("child_process");
const { inject, uninject } = require("../guildedModifier/inject/main");

const processingModal = document.getElementById("processingModal");
const processingText = document.getElementById("processingText");
const injectButton = document.getElementById("injectBtn");
const uninjectButton = document.getElementById("uninjectBtn");
const errorElement = document.getElementById("error");
let _debounce = false;

const reguildedDir = join(process.env.APPDATA ?? process.env.HOME, ".reguilded");
const platformModule = require("../guildedModifier/inject/injectUtil").getPlatformModule();

async function onclickInject() {
    if (!_debounce) {
        _debounce = true;

        processingText.innerText = "Injecting\nReGuilded...";
        processingModal.classList.remove("hidden");

        injectButton.classList.add("hidden");

        try {
            // TODO: Fix not waiting.
            await inject(platformModule.getAppDir(), reguildedDir);

            processingModal.classList.add("hidden");

            exec(platformModule.closeGuilded);

            uninjectButton.classList.remove("hidden");
        } catch (err) {
            console.log(err);
            errorElement.classList.remove("hidden");
        }

        _debounce = false;
    }
}

async function onclickUninject() {
    if (!_debounce) {
        _debounce = true;

        processingText.innerText = "Removing\nReGuilded...";
        processingModal.classList.remove("hidden");

        uninjectButton.classList.add("hidden");

        try {
            // TODO: Fix not waiting.
            await uninject(platformModule.getAppDir(), reguildedDir);

            processingModal.classList.add("hidden");

            exec(platformModule.closeGuilded);

            injectButton.classList.remove("hidden");
        } catch (err) {
            console.log(err);
            errorElement.classList.remove("hidden");
        }

        _debounce = false;
    }
}