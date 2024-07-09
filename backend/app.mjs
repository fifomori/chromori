console.clear();

import timers from "timers/promises";
import pp from "path";
import express from "express";
import generateConfig from "./generateConfig.mjs";
import { config as uConfig, fs, getDefaultPaths } from "./utils.mjs";

import registerApi from "./api.mjs";
import registerFs from "./fs.mjs";
import registerStatic from "./static.mjs";

const config = await uConfig.load();

if (!config.key || !config.gamePath) {
    console.log("Looks like you running chromori first time");
    console.log("chromori needs to get a decryption key and game directory path");

    const generateConfigFn = generateConfig[process.platform];
    if (!generateConfigFn) {
        console.error(`Cannot generate default config: unsupported platform (${process.platform})`);
        console.error("You can get decryption key and game directory path manually and put it to config.json");
        process.exit(1);
    }

    console.log("Launch OMORI from Steam");
    console.log();

    for await (const _ of timers.setInterval(2000)) {
        console.log("Waiting for OMORI process...");

        try {
            const generatedConfig = await generateConfigFn();
            if (generatedConfig) {
                console.log("Found the OMORI process. Now you can close OMORI and start chromori again");
                config.key = generatedConfig.key;
                config.gamePath = generatedConfig.gamePath;

                await uConfig.save(config);
                break;
            }
        } catch (e) {
            console.error("An error happened while generating a default config");
            console.error(e);
            break;
        }
    }
} else {
    const app = express();
    app.set("etag", false);

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "x-chromori-path");
        res.header("Cache-Control", "no-store");

        if (req.method === "OPTIONS") {
            return res.status(200).end();
        }

        next();
    });

    // stub path, will be replaced later on unsupported platforms
    if (!process.env.LOCALAPPDATA) process.env.LOCALAPPDATA = "/chromori/localappdata";

    const omoriPlatformSupport = process.platform === "win32" || process.platform === "darwin";
    const omoriPathDefault = getDefaultPaths("win32");
    const omoriPathPlatform = getDefaultPaths(process.platform);

    if (!omoriPlatformSupport) {
        console.log("This platform isn't supported by OMORI");
        console.log("chromori will fake it as win32 and fix some paths");
    }

    const wwwPath = pp.join(config.gamePath, config.gameDirectory);

    app.use(async (req, res, next) => {
        if (!req.headers["x-chromori-path"]) return next();
        res.chromoriPath = decodeURIComponent(req.headers["x-chromori-path"]);

        // steamworks api uses path for achievement ids
        if (req.url.startsWith("/api/steamworks")) {
            return next();
        }

        // redirect relative paths to game directory
        if (!pp.isAbsolute(res.chromoriPath)) {
            res.chromoriPath = pp.join(wwwPath, res.chromoriPath);
        }

        // TODO: test if darwin can use unfixed paths
        if (!omoriPlatformSupport) {
            // if (res.chromoriPath.includes(omoriPathDefault.config))
            //     console.debug(`Fixing config path in ${res.chromoriPath} => ${omoriPathPlatform.config}`);

            res.chromoriPath = await fs.matchPath(
                res.chromoriPath.replace(omoriPathDefault.config, omoriPathPlatform.config)
            );
        }

        if (req.url.startsWith("/api/fs")) {
            let resolved = pp.resolve(res.chromoriPath);
            if (!resolved.startsWith(omoriPathPlatform.config)) {
                let relative = pp.relative(config.gamePath, resolved);
                if (relative.startsWith("..") || pp.isAbsolute(relative)) {
                    console.warn(`Blocked forbidden path '${res.chromoriPath}' => '${relative}'`);
                    return res.status(403).end();
                }
            }
        }

        next();
    });

    app.use(express.raw({ inflate: true, limit: "50mb", type: () => true }));

    await registerApi(app);
    registerFs(app);
    registerStatic(app);

    app.listen(8000, "0.0.0.0", () => {
        console.log("chromori is running on http://localhost:8000");
    });
}
