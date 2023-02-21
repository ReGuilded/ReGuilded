/**
 * This script's entire purpose is just meant to be JavaScript that is ran in the Splash Loader. It just displays what version of ReGuilded you're running at the bottom of the window.
 * "vX.Y.Z - ReGuilded"
 */
// TODO: Add reGuildedInfo

const reGuildedSplashFooter = document.createElement("div");
reGuildedSplashFooter.innerText = `ReGuilded - v1.0.0-alpha`;
reGuildedSplashFooter.id = "reguildedSplashFooter";

const cssText =
  " color: #a3a3ac;" +
  " position: fixed;" +
  " bottom: 0;" +
  " margin: 8px;" +
  " font-family: GothamNarrowSSm;" +
  " font-size: 18px;" +
  " text-align: center";
reGuildedSplashFooter.setAttribute("style", cssText);

const elementExists = setInterval(function () {
  if (document.getElementById("splashTextBlock") != null) {
    document.getElementById("splashTextBlock")?.append(reGuildedSplashFooter);
    clearInterval(elementExists);
  }
}, 250);

export {};
