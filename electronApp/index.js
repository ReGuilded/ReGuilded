const { getPlatformModule } = require("../guildedModifier/inject/injectUtil");
const { inject, uninject } = require("../guildedModifier/inject/main")

const processingModal = document.getElementById("processingModal");
const processingText = document.getElementById("processingText");
const injectButton = document.getElementById("injectBtn");
const uninjectButton = document.getElementById("uninjectBtn");
const errorElement = document.getElementById("error");
let _debounce = false;

async function onclickInject() {
    if (!_debounce) {
        _debounce = true;

        processingText.innerText = "Injecting\nReGuilded...";
        processingModal.classList.remove("hidden");

        injectButton.classList.add("hidden");

        let injectReguilded = false;
        injectReguilded = await inject(getPlatformModule());

        processingModal.classList.add("hidden");
        if (injectReguilded) {
            uninjectButton.classList.remove("hidden");
        } else {
            errorElement.classList.remove("hidden");
        }

        _debounce = false;
    }
}

async function onclickUninject() {
    if (!_debounce) {
        _debounce = true;

        processingText.innerText = "Uninjecting\nReGuilded...";
        processingModal.classList.remove("hidden");

        uninjectButton.classList.add("hidden");
        
        let uninjectReguilded = false;
        uninjectReguilded = await uninject(getPlatformModule());

        processingModal.classList.add("hidden");
        if (uninjectReguilded) {
            injectButton.classList.remove("hidden");
        } else {
            errorElement.classList.remove("hidden");
        }

        _debounce = false;
    }
}