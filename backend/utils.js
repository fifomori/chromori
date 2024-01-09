const config = require("../config.json");

const fs = require("fs");
const pp = require("path");
const crypto = require("crypto");

module.exports = {
    encrypt(file) {
        // copied from OneLoader
        const iv = Buffer.from("EpicGamerMoment!");
        const cipherStream = crypto.createCipheriv("aes-256-ctr", config.key, iv);

        return Buffer.concat([iv, cipherStream.update(Buffer.from(file, "utf8")), cipherStream.final()]);
    },
    saveConfigSync(config) {
        fs.writeFileSync(pp.join(process.cwd(), "config.json"), JSON.stringify(config, null, 4));
    },
    async saveConfig(config) {
        fs.writeFile(pp.join(process.cwd(), "config.json"), JSON.stringify(config, null, 4));
    },
    fs: {
        ...require("fs/promises"),
        createReadStream: fs.createReadStream,
        async exists(path) {
            try {
                const file = await this.open(path, "r");
                await file.close();
                return true;
            } catch (e) {
                if (e.code !== "ENOENT") {
                    console.error(e);
                }
                return false;
            }
        },
        async isFile(path) {
            try {
                const stat = await this.stat(path);
                return stat.isFile();
            } catch (e) {
                if (e.code !== "ENOENT") {
                    console.error(e);
                }
                return false;
            }
        },
    },
};
