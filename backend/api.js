const config = require("../config.json");

/**
 * @param {import('express').Express} app
 */
module.exports = (app) => {
    app.all("/api/env", async (req, res) => {
        res.send({
            LOCALAPPDATA: process.env.LOCALAPPDATA,
            HOME: process.env.HOME,
            _PLATFORM: process.platform,
            _CWD: config.gamePath,
            _ARGV: [`--${config.key}`, ...config.argv],
        });
    });

    const greenworks = require("./greenworks/greenworks");
    const fallbackAchievements = require("./achievements.json");

    let greenworksInit = false;
    try {
        // TODO: allow disable steam in config
        // greenworksInit = greenworks.init();
        console.log("Connected to Steam");
    } catch (e) {
        console.log("Cannot connect to Steam, using fallback achievements method");
    }

    // TODO: use status instead of result: false
    app.all("/api/steamworks/achievements/init", async (req, res) => {
        res.send({ result: greenworksInit });
    });

    app.all("/api/steamworks/achievements/count", async (req, res) => {
        if (greenworksInit) {
            res.send({ number: greenworks.getNumberOfAchievements() });
        } else {
            res.send({ number: Object.keys(fallbackAchievements).length });
        }
    });

    app.all("/api/steamworks/achievements/list", async (req, res) => {
        if (greenworksInit) {
            res.send({ achievements: greenworks.getAchievementNames() });
        } else {
            res.send({ achievements: Object.keys(fallbackAchievements) });
        }
    });

    app.all("/api/steamworks/achievements/get", async (req, res) => {
        if (greenworksInit) {
            greenworks.getAchievement(
                res.chromoriPath,
                (isAchieved) => {
                    res.send({ result: isAchieved });
                },
                (e) => {
                    console.error(`greenworks.getAchievement failed: ${e}`);
                    res.send({ result: false });
                }
            );
        } else {
            res.send({ result: !!config.achievements[res.chromoriPath] });
        }
    });

    app.all("/api/steamworks/achievements/info", async (req, res) => {
        if (res.chromoriPath in fallbackAchievements) {
            res.send(fallbackAchievements[res.chromoriPath]);
        } else {
            console.error("fallback getAchievementInfo failed: Achievement name is not valid");
            res.send({});
        }
    });

    app.all("/api/steamworks/achievements/activate", async (req, res) => {
        if (greenworksInit) {
            greenworks.activateAchievement(
                res.chromoriPath,
                () => {
                    res.send({ result: true });
                },
                (e) => {
                    console.error(`greenworks.activateAchievement failed: ${e}`);
                    res.send({ result: false });
                }
            );
        } else {
            if (res.chromoriPath in fallbackAchievements) {
                config.achievements[res.chromoriPath] = true;
                await utils.saveConfig(config);
                res.send({ result: true });
            } else {
                console.error("fallback activateAchievement failed: Achievement name is not valid");
                res.send({ result: false });
            }
        }
    });
};
