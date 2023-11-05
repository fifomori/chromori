const pp = require("path");
const nfs = require("fs");
const fs = nfs.promises;

const express = require("express");

const patches = require("./patches");

const app = express();
app.set("etag", false);
app.use((req, res, next) => {
  res.header("Cache-Control", "no-store");
  next();
});

app.use("/chromori", express.static("web"));
app.use("/.oneloader-image-cache", express.static(".oneloader-image-cache"));
app.use("/", async (req, res) => {
  let path = pp.join(__dirname, "www", req.url);
  if (path.endsWith(pp.sep)) path += "index.html";

  try {
    path = decodeURIComponent(path);
  } catch (e) {}

  const baseName = pp.basename(path).toLowerCase();
  if (Object.keys(patches).includes(baseName)) {
    let file;
    try {
      file = await fs.readFile(path, "utf8");
    } catch (e) {}

    const patchedFile = patches[baseName](file);
    res.send(patchedFile);
  } else {
    try {
      const stat = await fs.stat(path);
      if (stat.isFile()) {
        if (pp.extname(path) == ".wasm") res.contentType("application/wasm");
        nfs.createReadStream(path).pipe(res);
        return;
      }
    } catch (e) {}

    res.status(404).send("ENOENT");
  }
});

module.exports = app;
