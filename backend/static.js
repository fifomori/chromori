const config = require("../config.json");

const express = require("express");
const pp = require("path");

const { fs } = require("./utils");
const { resolveOverlay } = require("./overlay");

const wwwPath = pp.join(config.gamePath, config.gameDirectory);
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

        // there is some shit like '/img/characters/$DW_OMORI_RUN%(8).rpgmvp' that we don't need to decode
        // at the same time there are files like /img/system/QTE%20Arrow.rpgmvp' that need to be decoded
        // i hope there are no files with malformed names that need to be decoded
        // (something like '/img/system/$SMTH%20%(3).rpgmv')
        // TODO: use some method that can decode ^^ this ^^ idk
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
