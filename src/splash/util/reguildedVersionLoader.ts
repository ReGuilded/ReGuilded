// TODO: Add reGuildedInfo

const reGuildedSplashFooter = document.createElement("div");
reGuildedSplashFooter.innerText = "v1.0.0 - ReGuilded";
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
    document.getElementById("splashTextBlock").append(reGuildedSplashFooter);
    clearInterval(elementExists);
  }
}, 250);
