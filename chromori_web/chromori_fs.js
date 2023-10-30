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

    const s = performance.now();
    chromori.fetch("/stat", path, (res) => {
      const e = performance.now();
      console.log(`stat('${path}') ${res} in ${e - s}ms`);

      callback(null, createStat(res));
    });
  },
  statSync(path) {
    const s = performance.now();
    const data = chromori.fetchSync("/stat", path);
    const e = performance.now();

    console.log(`statSync('${path}') ${data} in ${e - s}ms`);
    return createStat(data);
  },

  existsSync(path) {
    return this.statSync(path).exists();
  },

  openSync() {},

  // TODO: implement node-like callbackOrOptions, callbackOrUndefined
  readFile(path, callback) {
    if (!callback) return;

    const s = performance.now();
    chromori.fetch(
      "/readFile",
      path,
      (res) => {
        const e = performance.now();

        const buffer = Buffer.from(res);

        if (buffer.toString() == "ENOENT") {
          console.log(`readFile('${path}'): error: ENOENT in ${e - s}ms`);
          if (path.includes("CUTSCENE.json")) callback(/* without error */);
          else callback(createErrorENOENT());
          return;
        }

        console.log(`readFile('${path}'): ${res.byteLength} bytes in ${e - s}ms`);
        callback(null, buffer);
      },
      { type: "arraybuffer" }
    );
  },
  readFileSync(path, options = "ascii") {
    // HACK: Redirect Steamworks to empty file
    path = path.replace(/Archeia_Steamworks/gi, "--------------------");

    const s = performance.now();

    const data = chromori.fetchSync("/readFile", path, {
      mime: "text/plain; charset=x-user-defined",
    });
    const buffer = Buffer.from(data, "ascii");

    const e = performance.now();
    if (buffer.toString() == "ENOENT") {
      console.log(`readFileSync('${path}'): ENOENT in ${e - s}ms`);
      throw createErrorENOENT();
    }

    console.log(`readFileSync('${path}'): in ${e - s}ms`);

    let encoding = typeof options === "string" ? options : options.encoding;
    if (encoding === "utf8" || encoding === "utf-8") return chromori.decoder.decode(buffer);
    return buffer;
  },

  writeFile(path, data, callback) {
    if (!callback) return;

    const s = performance.now();

    if (typeof data === "string") {
      data = chromori.encoder.encode(data);
    }

    chromori.fetch(
      "/writeFile",
      path,
      () => {
        const e = performance.now();
        console.log(`writeFile('${path}') in ${e - s}ms`);
        callback();
      },
      { data }
    );
  },
  writeFileSync(path, data) {
    const s = performance.now();

    if (typeof data === "string") {
      data = chromori.encoder.encode(data);
    }

    chromori.fetchSync("/writeFile", path, { data });

    const e = performance.now();
    console.log(`writeFileSync('${path}') in ${e - s}ms`);
  },

  writeSync() {},

  readdir(path, callback) {
    const s = performance.now();
    chromori.fetch("/readDir", path, (data) => {
      const list = data.split(":");
      const e = performance.now();

      console.log(`readdir('${path}') ${list} in ${e - s}ms`);
      callback(null, list);
    });
  },

  readdirSync(path) {
    const s = performance.now();
    let data = chromori.fetchSync("/readDir", path);
    data = data.split(":");
    const e = performance.now();

    console.log(`readdirSync('${path}') ${data} in ${e - s}ms`);
    return data;
  },

  /**
   * @param {string} path
   */
  mkdirSync(path) {
    const s = performance.now();
    chromori.fetchSync("/mkDir", path);
    const e = performance.now();

    console.log(`mkdirSync('${path}') in ${e - s}ms`);
  },

  /**
   * @param {string} path
   */
  unlinkSync(path) {
    const s = performance.now();
    chromori.fetchSync("/unlink", path);
    const e = performance.now();

    console.log(`unlinkSync('${path}') in ${e - s}ms`);
  },
};
