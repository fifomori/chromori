import { config as uConfig } from "./utils.mjs";
const config = await uConfig.load();

import fallbackAchievements from "./fallbackAchievements.mjs";
import steamworks from "steamworks.js"

/**
 * @param {import('express').Express} app
 */
export default async (app) => {
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

    let client = config.noSteam ? null : steamworks.init(1150690);
    const steamworksInit = !!client

    app.all("/api/steamworks/achievements/init", async (req, res) => {
        res.send({ result: !!client });
    });

    app.all("/api/steamworks/achievements/count", async (req, res) => {
        res.send({ number: Object.keys(fallbackAchievements).length });
    });

    app.all("/api/steamworks/achievements/list", async (req, res) => {
        res.send({ achievements: Object.keys(fallbackAchievements) });
    });

    app.all("/api/steamworks/achievements/get", async (req, res) => {
        if (steamworksInit) {
            client.achievement.isActivated(res.chromoriPath);
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
        if (steamworksInit) {
            client.achievement.activate(res.chromoriPath)
            res.send({ result: true });
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
