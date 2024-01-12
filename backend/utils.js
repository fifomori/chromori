const config = require("../config.json");

const fs = require("fs");
const fsp = require("fs/promises");
const pp = require("path");
const crypto = require("crypto");

function encrypt(file) {
    // copied from OneLoader
    const iv = Buffer.from("EpicGamerMoment!");
    const cipherStream = crypto.createCipheriv("aes-256-ctr", config.key, iv);

    return Buffer.concat([iv, cipherStream.update(Buffer.from(file, "utf8")), cipherStream.final()]);
}

function getDefaultPaths() {
    switch (process.platform) {
        case "win32":
            return {
                root: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\OMORI",
                config: pp.join(process.env.LOCALAPPDATA, "OMORI"),
            };
        default:
            throw "Unsupported platform";
    }
}

function validateConfig(config) {
    const paths = getDefaultPaths();

    return {
        key: config.key,
        gamePath: config.gamePath || paths.root,
        gameDirectory: config.gameDirectory || "www",
        argv: config.argv || [],
        achievements: config.achievements || [],
        noSteam: config.noSteam || false,
    };
}

module.exports.encrypt = encrypt;
module.exports.getDefaultPaths = getDefaultPaths;

module.exports.config = {
    saveSync(config) {
        fs.writeFileSync(pp.join(process.cwd(), "config.json"), JSON.stringify(validateConfig(config), null, 4));
    },
    async save(config) {
        await fsp.writeFile(pp.join(process.cwd(), "config.json"), JSON.stringify(validateConfig(config), null, 4));
    },
};

module.exports.fs = {
    ...fsp,
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
};
