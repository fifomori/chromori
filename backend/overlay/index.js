const config = require("../../config.json");

const pp = require("path");
const overlays = require("./overlays");
const { fs, encrypt } = require("../utils");

const wwwPath = pp.join(config.gamePath, "www");
const filesPath = pp.join(process.cwd(), "backend", "overlay", "files"); // TODO: сделать кароче чтоб брало название этого файла и от него дирнейм

module.exports = {
    /**
     * @param {string} path
     */
    async resolveOverlay(path) {
        const overlayPath = path.toLowerCase();
        const overlay = overlays[overlayPath];
        const baseName = pp.basename(overlayPath);

        if (!overlay && overlays[baseName]) {
            return console.error(`Migrate overlay '${baseName}' (probably to '${overlayPath}')`);
        }
        if (!overlay) return;

        let result = "";
        switch (overlay.type) {
            case "replace":
                if (overlay.fileName) {
                    result = await fs.readFile(pp.join(filesPath, overlay.fileName), "utf8");
                } else if (overlay.content) {
                    result = overlay.content;
                } else {
                    throw "something wrong in replace";
                }
                break;

            case "merge":
                if (typeof overlay.merge === "function") {
                    const originalFile = await fs.readFile(pp.join(wwwPath, path), "utf8");
                    const customFile = await fs.readFile(pp.join(filesPath, overlay.fileName), "utf8");

                    result = await overlay.merge(originalFile, customFile);
                } else {
                    throw "something wrong in merge";
                }
                break;

            case "custom":
                if (typeof overlay.patch === "function") {
                    const originalFile = await fs.readFile(pp.join(wwwPath, path), "utf8");

                    result = await overlay.patch(originalFile);
                } else {
                    throw "something wrong in custom";
                }
                break;

            default:
                throw "something wrong in switch";
        }

        if (overlay.encrypt) {
            result = encrypt(result);
        }

        return result;
    },
};
