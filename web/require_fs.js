/// <reference path="intellisense.d.ts"/>

const ERRNO_ENOENT = "ENOENT";

const createStat = (type) => {
  return {
    isFile: () => type === "file",
    isDirectory: () => type === "dir",
    exists: () => type !== ERRNO_ENOENT,
  };
};

const createErrorNoEnt = () => new Error(ERRNO_ENOENT);

module.exports = {
  stat(path, callback) {
    if (!callback) return;
    chromori.fetch("/stat", path, (res) => {
      callback(null, createStat(res));
    });
  },

  statSync(path) {
    const data = chromori.fetchSync("/stat", path);
    return createStat(data);
  },

  existsSync(path) {
    return this.statSync(path).exists();
  },

  readFile(path, callback) {
    if (!callback) return;

    chromori.fetch(
      "/readFile",
      path,
      (res) => {
        const buffer = Buffer.from(res);

        if (buffer.toString() == ERRNO_ENOENT) {
          if (path.includes("CUTSCENE.json")) callback(/* without error */);
          else callback(createErrorNoEnt());
        } else {
          callback(null, buffer);
        }
      },
      { type: "arraybuffer" }
    );
  },

  readFileSync(path, options = "ascii") {
    const data = chromori.fetchSync("/readFile", path, {
      mime: "text/plain; charset=x-user-defined",
    });
    const buffer = Buffer.from(data, "ascii");

    if (buffer.toString() == ERRNO_ENOENT) {
      throw createErrorNoEnt();
    }

    let encoding = typeof options === "string" ? options : options.encoding;
    if (encoding === "utf8" || encoding === "utf-8") return chromori.decoder.decode(buffer);
    return buffer;
  },

  writeFile(path, data, callback) {
    if (!callback) return;

    if (typeof data === "string") {
      data = chromori.encoder.encode(data);
    }

    chromori.fetch(
      "/writeFile",
      path,
      () => {
        callback();
      },
      { data }
    );
  },

  writeFileSync(path, data) {
    if (typeof data === "string") {
      data = chromori.encoder.encode(data);
    }
    chromori.fetchSync("/writeFile", path, { data });
  },

  readdir(path, callback) {
    chromori.fetch("/readDir", path, (data) => {
      const list = data.split(":");
      callback(null, list);
    });
  },

  readdirSync(path) {
    let data = chromori.fetchSync("/readDir", path);
    data = data.split(":");
    return data;
  },

  mkdirSync(path) {
    chromori.fetchSync("/mkDir", path);
  },

  unlinkSync(path) {
    chromori.fetchSync("/unlink", path);
  },

  openSync() {},
  writeSync() {},
};
