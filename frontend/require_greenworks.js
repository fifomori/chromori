/// <reference path="intellisense.d.ts"/>

let isFallback = !chromori.fetchSync("/steamworks/achievements/init", null, { json: true }).res.result;

module.exports = {
    initAPI() {
        return true;
    },
    getNumberOfAchievements() {
        return chromori.fetchSync("/steamworks/achievements/count", null, { json: true }).res.number;
    },
    getAchievementNames() {
        return chromori.fetchSync("/steamworks/achievements/list", null, { json: true }).res.achievements;
    },
    getAchievement(name, callback) {
        chromori.fetch(
            "/steamworks/achievements/get",
            name,
            (status, res) => {
                callback(res.result);
            },
            { json: true }
        );
    },
    activateAchievement(id, successCallback, errorCallback) {
        chromori.fetch(
            "/steamworks/achievements/activate",
            id,
            (status, res) => {
                if (!res.result) return errorCallback();

                if (isFallback) {
                    /** @type {AchievementData} */
                    const info = chromori.fetchSync("/steamworks/achievements/info", id, {
                        json: true,
                    });
                    if (!info.name) return errorCallback();

                    const el = chromori.createAchievementElement(info.name, info.description, info.img, id);
                    document.querySelector(".chromori_achievement_area").appendChild(el);

                    setTimeout(() => {
                        document.getElementById(id)?.remove();
                    }, 5000);
                }

                successCallback();
            },
            { json: true }
        );
    },
};
