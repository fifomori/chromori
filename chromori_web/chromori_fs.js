/**
 * @param {string} type
 */
const createStat = (type) => {
  return {
    isFile: () => type == "file",
    isDirectory: () => type == "dir",
    exists: () => type != "ENOENT",
  };
};

const createErrorENOENT = () => new Error("ENOENT");

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

  openSync() {},

  // TODO: implement node-like callbackOrOptions, callbackOrUndefined
  readFile(path, callback) {
    if (!callback) return;

    chromori.fetch(
      "/readFile",
      path,
      (res) => {
        const buffer = Buffer.from(res);

        if (buffer.toString() == "ENOENT") {
          if (path.includes("CUTSCENE.json")) callback(/* without error */);
          else callback(createErrorENOENT());
          return;
        }

        callback(null, buffer);
      },
      { type: "arraybuffer" }
    );
  },

  readFileSync(path, options = "ascii") {
    // HACK: Redirect Steamworks to empty file
    path = path.replace(/Archeia_Steamworks/gi, "--------------------");

    const data = chromori.fetchSync("/readFile", path, {
      mime: "text/plain; charset=x-user-defined",
    });
    const buffer = Buffer.from(data, "ascii");

    if (buffer.toString() == "ENOENT") {
      throw createErrorENOENT();
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

  writeSync() {},

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

  /**
   * @param {string} path
   */
  mkdirSync(path) {
    chromori.fetchSync("/mkDir", path);
  },

  /**
   * @param {string} path
   */
  unlinkSync(path) {
    chromori.fetchSync("/unlink", path);
  },
};
