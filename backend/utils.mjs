import nfs from "fs";
import nfsp from "fs/promises";
import pp from "path";
import crypto from "crypto";

export function encrypt(file) {
    // copied from OneLoader
    const iv = Buffer.from("EpicGamerMoment!");
    const cipherStream = crypto.createCipheriv("aes-256-ctr", config.key, iv);

    return Buffer.concat([iv, cipherStream.update(Buffer.from(file, "utf8")), cipherStream.final()]);
}

/**
 * @param {typeof process.platform} platform
 * @returns
 */
export function getDefaultPaths(platform) {
    switch (platform) {
        case "win32":
            return {
                root: pp.normalize("C:/Program Files (x86)/Steam/steamapps/common/OMORI"),
                config: pp.join(process.env.LOCALAPPDATA, "OMORI"),
            };
        case "darwin":
            return {
                root: pp.join(process.env.HOME, "Library/Application Support/Steam/steamapps/OMORI"),
                config: pp.join(process.env.HOME, "Library/Preferences/com.omocat.omori"),
            };
        // TODO: linux
        default:
            throw "Unsupported platform";
    }
}

export const fs = {
    ...nfsp,
    createReadStream: nfs.createReadStream,
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
    existsSync(path) {
        try {
            const file = nfs.openSync(path, "r");
            nfs.closeSync(file);
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

function createConfigJSON(config = {}) {
    const paths = getDefaultPaths(process.platform);

    const res = {
        key: config.key,
        gamePath: config.gamePath || paths.root,
        gameDirectory: config.gameDirectory || "www",
        argv: config.argv || [],
        achievements: config.achievements || [],
        noSteam: config.noSteam || false,
    };

    return JSON.stringify(res, null, 4);
}

const configPath = pp.join(process.cwd(), "config.json");

export const config = {
    async save(config) {
        await nfsp.writeFile(configPath, createConfigJSON(config));
    },
    saveSync(config) {
        nfs.writeFileSync(configPath, createConfigJSON(config));
    },
    async load() {
        if (!(await fs.exists(configPath))) await this.save();
        return JSON.parse(await nfsp.readFile(configPath, "utf8"));
    },
    loadSync() {
        if (!fs.existsSync(configPath)) this.saveSync();
        return JSON.parse(nfs.readFileSync(configPath, "utf8"));
    },
};

export default { fs, config };
