{
  const fpsMeterScript = document.createElement("script");
  fpsMeterScript.type = "text/javascript";
  fpsMeterScript.src = "js/libs/fpsmeter.js";

  if (document.head) document.head.appendChild(fpsMeterScript);
  else if (document.body) document.body.appendChild(fpsMeterScript);
}

window.addEventListener("load", () => {
  // FIXME: this doesn't work with OneLoader
  // TODO: implement achievements (maybe)
  // Even though this is a unlink from Steam, the key is still required to boot
  Scene_Boot = class extends Scene_Boot {
    hasSteamwork() {
      return true;
    }
    getAchievementsData() {
      return;
    }
  };
});
