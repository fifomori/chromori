console.clear();

const config = require("../config.json"); // TODO: autocreate
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
            utils.saveConfigSync(config);
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

    app.use((req, res, next) => {
        res.chromoriPath = decodeURIComponent(req.headers["x-chromori-path"]);
        if (req.url.startsWith("/api/fs")) {
            let resolved = pp.resolve(res.chromoriPath);
            // TODO: allowed base paths list
            if (!resolved.startsWith(pp.join(process.env.LOCALAPPDATA, "OMORI"))) {
                let relative = pp.relative(config.gamePath, resolved);
                if (relative.startsWith("..") || pp.isAbsolute(relative)) {
                    res.status(403).end();
                    return;
                }
            }
        }

        next();
    });

    app.use(express.raw({ inflate: true, limit: "50mb", type: () => true }));

    require("./api")(app);
    require("./fs")(app);
    require("./static")(app);

    app.listen(80, "0.0.0.0", () => {
        console.log("chromori static is running on http://localhost:80");
    });
}
