import { join, basename } from "path";
import overlays from "./overlays.mjs";
import { config as uConfig, fs, encrypt } from "../utils.mjs";
const config = await uConfig.load();

const wwwPath = join(config.gamePath, config.gameDirectory);
const filesPath = join(process.cwd(), "backend/overlay/files");

/**
 * @param {string} path
 */
export async function resolveOverlay(path) {
    const overlayPath = path.toLowerCase().replace(/\\/g, "/");
    const overlay = overlays[overlayPath];
    const baseName = basename(overlayPath);

    if (!overlay && overlays[baseName]) {
        return console.error(`Migrate overlay '${baseName}' (probably to '${overlayPath}')`);
    }
    if (!overlay) return;

    let result = "";
    switch (overlay.type) {
        case "replace":
            if (overlay.fileName) {
                result = await fs.readFile(join(filesPath, overlay.fileName), "utf8");
            } else if (overlay.content) {
                result = overlay.content;
            } else {
                throw "something wrong in replace";
            }
            break;

        case "merge":
            if (typeof overlay.merge === "function") {
                const originalFile = await fs.readFile(join(wwwPath, path), "utf8");
                const customFile = await fs.readFile(join(filesPath, overlay.fileName), "utf8");

                result = await overlay.merge(originalFile, customFile);
            } else {
                throw "something wrong in merge";
            }
            break;

        case "custom":
            if (typeof overlay.patch === "function") {
                const originalFile = await fs.readFile(join(wwwPath, path), "utf8");

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
}
