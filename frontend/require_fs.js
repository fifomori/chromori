/// <reference path="intellisense.d.ts"/>

const ERRNO_ENOENT = "ENOENT";

const createStat = (status, type) => {
    return {
        isFile: () => type === "file",
        isDirectory: () => type === "dir",
        exists: () => status === 200,
    };
};

const createErrorNoEnt = () => new Error(ERRNO_ENOENT);

// TODO: add console warning when async function called without callback

module.exports = {
    readFile(path, callback) {
        if (!callback) return;

        chromori.fetch(
            "/fs/readFile",
            path,
            (status, res) => {
                if (status != 200) {
                    if (path.includes("CUTSCENE.json")) callback(/* without error */);
                    else callback(createErrorNoEnt());
                } else {
                    callback(null, Buffer.from(res));
                }
            },
            { type: "arraybuffer" }
        );
    },

    readFileSync(path, options = "ascii") {
        const { status, res } = chromori.fetchSync("/fs/readFile", path, {
            mime: "text/plain; charset=x-user-defined",
        });

        if (status != 200) throw createErrorNoEnt();
        const buffer = Buffer.from(res, "ascii");

        let encoding = typeof options === "string" ? options : options.encoding;
        if (encoding === "utf8" || encoding === "utf-8") return chromori.decoder.decode(buffer);
        return buffer;
    },

    writeFile(path, data, callback) {
        if (!callback) return;

        if (typeof data === "string") {
            data = chromori.encoder.encode(data);
        }

        chromori.fetch("/fs/writeFile", path, callback, { data });
    },

    writeFileSync(path, data) {
        if (typeof data === "string") {
            data = chromori.encoder.encode(data);
        }
        chromori.fetchSync("/fs/writeFile", path, { data });
    },

    readdir(path, callback) {
        chromori.fetch("/fs/readDir", path, (status, res) => {
            const list = res.split(":");
            callback(null, list);
        });
    },

    readdirSync(path) {
        let { res } = chromori.fetchSync("/fs/readDir", path);
        res = res.split(":");
        return res;
    },

    // TODO: mkdir

    mkdirSync(path) {
        chromori.fetchSync("/fs/mkDir", path);
    },

    // TODO: unlink

    unlinkSync(path) {
        chromori.fetchSync("/fs/unlink", path);
    },

    stat(path, callback) {
        if (!callback) return;
        chromori.fetch("/fs/stat", path, (status, res) => {
            callback(null, createStat(status, res));
        });
    },

    statSync(path) {
        const { status, res } = chromori.fetchSync("/fs/stat", path);
        return createStat(status, res);
    },

    existsSync(path) {
        return this.statSync(path).exists();
    },

    // TODO: lstat?

    rename(oldPath, newPath, callback) {
        if (!callback) return;
        chromori.fetch("/fs/rename", oldPath, callback, { data: newPath });
    },

    // TODO: renameSync?

    // Stubs
    openSync() {},
    writeSync() {},
};
