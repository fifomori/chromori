import { config as uConfig } from "./utils.mjs";
const config = await uConfig.load();

import * as greenworks from "./greenworks/greenworks.js";
import fallbackAchievements from "./fallbackAchievements.mjs";

/**
 * @param {import('express').Express} app
 */
export default (app) => {
    app.all("/api/env", async (req, res) => {
        const keyArg = config.key === "test" ? "test" : `--${config.key}`;
        res.send({
            LOCALAPPDATA: process.env.LOCALAPPDATA,
            HOME: process.env.HOME,
            _PLATFORM: process.platform,
            _CWD: config.gamePath,
            _ARGV: [keyArg, ...config.argv],
            _CONFIG: config,
        });
    });

    let greenworksInit = false;
    if (!config.noSteam) {
        try {
            greenworksInit = greenworks.init();
            console.log("Connected to Steam");
        } catch (e) {
            console.log("Failed to connect to Steam");
        }
    }

    if (!greenworksInit) console.log("Using fallback achievements method");

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
            console.error("fallback.getAchievementInfo failed: Achievement name is not valid");
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
                await uConfig.save(config);
                res.send({ result: true });
            } else {
                console.error("fallback.activateAchievement failed: Achievement name is not valid");
                res.send({ result: false });
            }
        }
    });
};
