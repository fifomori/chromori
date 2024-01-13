import nfs from "fs";
import nfsp from "fs/promises";
import pp from "path";
import crypto from "crypto";

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
    /**
     * based on https://github.com/surrealegg/omori-linux-patch/blob/40a9d75951635a26de7f5296cd6496009f1c1138/Surrealegg_LinuxPatch.js#L16
     * @param {string} target
     */
    async matchPath(target) {
        if (process.platform == "win32") return target;
        target = pp.normalize(target);
        const sections = target.split("/").filter(Boolean);

        /**
         * @param {string} match
         * @param {string} directory
         */
        function tryMatchPaths(match, directory) {
            const lowerCase = match.toLowerCase();
            for (const entry of directory) {
                if (entry.toLowerCase() === lowerCase) {
                    return entry;
                }
            }
            throw `'${match}': no such file or directory`;
        }

        let resolvedPath = "";
        for (const section of sections) {
            try {
                const directory = await fs.readdir("/" + resolvedPath);
                resolvedPath += "/" + tryMatchPaths(section, directory);
            } catch (e) {
                // console.warn(`'${target}': '${section}': no such file or directory, not matching`);
                resolvedPath += "/" + section;
            }
        }
        return resolvedPath;
    },
};

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
                root: pp.join(
                    process.env.HOME,
                    "Library/Application Support/Steam/steamapps",
                    "OMORI/OMORI.app/OMORI.app/Contents/Resources/app.nw"
                ),
                config: pp.join(process.env.HOME, "Library/Preferences/com.omocat.omori"),
            };
        case "linux":
            const steamDefaultPrefix = pp.join(process.env.HOME, ".steam/root");
            const steamFlatpakPrefix = pp.join(process.env.HOME, ".var/app/com.valvesoftware.Steam/data/Steam");

            let steamPrefix = steamDefaultPrefix;
            if (fs.existsSync(steamFlatpakPrefix)) steamPrefix = steamFlatpakPrefix;

            return {
                root: pp.join(steamPrefix, "steamapps/common/OMORI"),
                config: process.env.XDG_CONFIG_HOME
                    ? pp.join(process.env.XDG_CONFIG_HOME, "omori")
                    : pp.join(process.env.HOME, ".local/config/omori"),
            };
        // TODO: other platforms
        default:
            throw "Unsupported platform";
    }
}

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
    async load() {
        if (!(await fs.exists(configPath))) await this.save();
        return JSON.parse(await nfsp.readFile(configPath, "utf8"));
    },
};

const iConfig = await config.load();

export function encrypt(file) {
    // copied from OneLoader
    const iv = Buffer.from("EpicGamerMoment!");
    const cipherStream = crypto.createCipheriv("aes-256-ctr", iConfig.key, iv);

    return Buffer.concat([iv, cipherStream.update(Buffer.from(file, "utf8")), cipherStream.final()]);
}

export default { fs, config };
