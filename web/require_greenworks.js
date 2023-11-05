/// <reference path="intellisense.d.ts"/>

module.exports = {
  initAPI() {
    return true;
  },
  getNumberOfAchievements() {
    return chromori.fetchSync("/steamworks/achievements/count", null, { json: true }).number;
  },
  getAchievementNames() {
    return chromori.fetchSync("/steamworks/achievements/list", null, { json: true }).achievements;
  },
  getAchievement(name, callback) {
    chromori.fetch(
      "/steamworks/achievements/get",
      name,
      (res) => {
        console.log(res);
        console.log(typeof res.result);
        callback(res.result);
      },
      { json: true }
    );
  },
  activateAchievement(name, successCallback, errorCallback) {
    chromori.fetch(
      "/steamworks/achievements/activate",
      name,
      (res) => {
        console.log(res);
        console.log(typeof res.result);
        if (res.result) successCallback();
        else errorCallback();
      },
      { json: true }
    );
  },
};
