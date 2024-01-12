console.clear();

const config = require("../config.json");
const getKey = require("./getKey");
const utils = require("./utils");

if (!config.key) {
    console.log("Looks like you running chromori first time");
    console.log("chromori needs to get a decryption key");
    console.log("Launch OMORI from Steam");
    console.log();

    const interval = setInterval(() => {
        console.log("Waiting for OMORI process...");
        const key = getKey.windows();
        if (key) {
            console.log("Found the OMORI process. Now you can close OMORI and start chromori");
            config.key = key;
            utils.config.save(config);
            clearInterval(interval);
        }
    }, 2000);
} else {
    const pp = require("path");
    const express = require("express");

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

    const omoriPlatformSupport = process.platform === "win32" || process.platform === "darwin";
    const omoriPathWin32 = utils.getDefaultPaths("win32");
    const omoriPathPlatform = utils.getDefaultPaths(process.platform);

    if (!omoriPlatformSupport) {
        console.log("This platform isn't supported by OMORI");
        console.log("chromori will fake it as win32 and fix some paths");
    }

    const wwwPath = pp.join(config.gamePath, config.gameDirectory);

    app.use((req, res, next) => {
        res.chromoriPath = decodeURIComponent(req.headers["x-chromori-path"]);
        // redirect relative paths to game directory
        if (!pp.isAbsolute(res.chromoriPath)) {
            res.chromoriPath = pp.join(wwwPath, res.chromoriPath);
        }

        if (req.url.startsWith("/api/fs")) {
            let resolved = pp.resolve(res.chromoriPath);
            if (!resolved.startsWith(omoriPathPlatform.config)) {
                let relative = pp.relative(config.gamePath, resolved);
                if (relative.startsWith("..") || pp.isAbsolute(relative)) {
                    console.warn(`Blocked forbidden path '${res.chromoriPath}' => '${relative}'`);
                    res.status(403).end();
                    return;
                }
            }

            if (!omoriPlatformSupport) {
                if (res.chromoriPath.includes(omoriPathWin32.config))
                    console.debug(`Fixing config path in ${res.chromoriPath}`);

                res.chromoriPath.replace(omoriPathWin32.config);
            }
        }

        next();
    });

    app.use(express.raw({ inflate: true, limit: "50mb", type: () => true }));

    require("./api")(app);
    require("./fs")(app);
    require("./static")(app);

    app.listen(80, "0.0.0.0", () => {
        console.log("chromori is running on http://localhost:80");
    });
}
