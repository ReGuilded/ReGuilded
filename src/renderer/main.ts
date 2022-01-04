import webpackPush from "./webpackInject";

function setPush(obj) {
    Object.defineProperty(window.webpackJsonp, "push", obj)
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
                set: (value) => setPush({get: () => value})
            });
        });
});