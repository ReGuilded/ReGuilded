const { isInjected } = require("../guildedModifier/inject/injectUtil");

window.addEventListener('DOMContentLoaded', () => {
    if (isInjected() == null) {
        document.getElementById("error").classList.remove("hidden");

        return;
    }

    if (!isInjected()) {
        document.getElementById("injectBtn").classList.remove("hidden");
    } else {
        document.getElementById("uninjectBtn").classList.remove("hidden");
    }
});