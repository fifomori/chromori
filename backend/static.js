const config = require("../config.json");

const express = require("express");
const pp = require("path");

const { fs } = require("./utils");
const { resolveOverlay } = require("./overlay");

const wwwPath = pp.join(config.gamePath, "www");
const frontendPath = pp.join(process.cwd(), "frontend");

/**
 * @param {import('express').Express} app
 */
module.exports = (app) => {
    app.use("/chromori", express.static(frontendPath));
    app.use("/.oneloader-image-cache", express.static(".oneloader-image-cache"));
    app.use("/", async (req, res) => {
        let url = req.url;
        if (url == "/") url += "index.html";

        // TODO: напиши нормально
        // there is some shit like '/img/characters/$DW_OMORI_RUN%(8).rpgmvp' that we don't need to decode
        try {
            url = decodeURIComponent(url);
        } catch (e) {
            // console.error(`decodeURIComponent('${url}') error`);
        }

        try {
            const fileOverlay = await resolveOverlay(url);

            if (fileOverlay) {
                return res.send(fileOverlay);
            } else {
                const path = pp.join(wwwPath, url);

                if (await fs.isFile(path)) {
                    if (pp.extname(path) == ".wasm") res.contentType("application/wasm");
                    return fs.createReadStream(path).pipe(res);
                } else {
                    console.log(`static: '${path}' is not a file`);
                }
            }
        } catch (e) {
            console.error("static error");
            console.error(e);
        }

        res.status(404).end();
    });
};
