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
    getDefaultPaths() {
        switch (process.platform) {
            case "win32":
                return {
                    root: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\OMORI",
                    config: pp.join(process.env.LOCALAPPDATA, "OMORI"),
                };
            default:
                throw "Unsupported platform";
        }
    },
    config: {
        _validate(config) {
            const paths = this.getDefaultPaths();

            return {
                key: config.key,
                gamePath: config.gamePath || paths.root,
                gameDirectory: config.gameDirectory || "www",
                argv: config.argv || [],
                achievements: config.achievements || [],
                noSteam: config.noSteam || false,
            };
        },
        saveSync(config) {
            fs.writeFileSync(pp.join(process.cwd(), "config.json"), JSON.stringify(_validate(config), null, 4));
        },
        async save(config) {
            fs.writeFile(pp.join(process.cwd(), "config.json"), JSON.stringify(_validate(config), null, 4));
        },
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
