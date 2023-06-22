/**
 * This script's entire purpose is just meant to be JavaScript that is ran in the Splash Loader. It just displays what version of ReGuilded you're running at the bottom of the window.
 * "vX.Y.Z - ReGuilded"
 */
// TODO: Load version from window.ReGuilded.version

const reguildedSplashFooter = document.createElement("div");
reguildedSplashFooter.innerText = `ReGuilded - ${window["reguildedVersion"]}`;
reguildedSplashFooter.id = "reguildedSplashFooter";

const cssText =
  " color: #a3a3ac;" +
  " position: fixed;" +
  " bottom: 0;" +
  " margin: 8px;" +
  " font-family: GothamNarrowSSm;" +
  " font-size: 18px;" +
  " text-align: center";
reguildedSplashFooter.setAttribute("style", cssText);

const elementExists = setInterval(function () {
  if (document.getElementById("splashTextBlock") != null) {
    document.getElementById("splashTextBlock")?.append(reguildedSplashFooter);
    clearInterval(elementExists);
  }
}, 250);

export {};
