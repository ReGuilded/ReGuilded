const { exec } = require("child_process");

const processingModal = document.getElementById("processingModal");
const processingText = document.getElementById("processingText");
const injectButton = document.getElementById("injectBtn");
const uninjectButton = document.getElementById("uninjectBtn");
const errorElement = document.getElementById("error");
let _debounce = false;

// TODO: Add a processing modal, when injecting or uninjecting...

function inject() {
    if (!_debounce) {
        _debounce = true;

        processingText.innerText = "Injecting\nReGuilded...";
        processingModal.classList.remove("hidden");

        injectButton.classList.add("hidden");

        exec("npm run inject", (error) => {
            processingModal.classList.add("hidden");

            if (error) {
                errorElement.classList.remove("hidden");
            } else {
                uninjectButton.classList.remove("hidden");
            }

            _debounce = false;
        });
    }
}

function uninject() {
    if (!_debounce) {
        _debounce = true;

        processingText.innerText = "Uninjecting\nReGuilded...";
        processingModal.classList.remove("hidden");

        uninjectButton.classList.add("hidden");
        
        exec("npm run uninject", (error) => {
            processingModal.classList.add("hidden");

            if (error) {
                errorElement.classList.remove("hidden");
            } else {
                injectButton.classList.remove("hidden");
            }

            _debounce = false;
        });
    }
}