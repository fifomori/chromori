const pp = require("path");
const nfs = require("fs");
const fs = nfs.promises;

const express = require("express");
const bodyParser = require("body-parser");

const patches = require("./patches");

const app = express();
app.set("etag", false);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "x-chromori-path");
  res.header("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use((req, res, next) => {
  res.chromoriPath = req.headers["x-chromori-path"];
  next();
});

app.use(bodyParser.raw({ inflate: true, limit: "50mb", type: () => true }));

app.all("/env", async (req, res) => {
  let argv = [];
  try {
    argv = await fs.readFile("argv", { encoding: "ascii" });
    argv = argv.split(" ");
  } catch (e) {
    console.error(e);
  }

  res.send(
    JSON.stringify({
      LOCALAPPDATA: process.env.LOCALAPPDATA,
      HOME: process.env.HOME,
      _PLATFORM: process.platform,
      _DIRNAME: __dirname,
      _ARGV: [
        `--${await fs.readFile("key", { encoding: "ascii" })}`, //
        ...argv,
      ],
    })
  );
});

// TODO: replace all ENOENT bodies with 404 status

app.all("/stat", async (req, res) => {
  try {
    const stat = await fs.stat(res.chromoriPath);
    res.send(stat.isFile() ? "file" : "dir");
  } catch (e) {
    res.send("ENOENT");
  }
});

app.all("/readFile", async (req, res) => {
  try {
    res.chromoriPath = decodeURIComponent(res.chromoriPath);
  } catch (e) {}

  const baseName = pp.basename(res.chromoriPath).toLowerCase();
  if (Object.keys(patches).includes(baseName)) {
    let file = "";
    try {
      file = await fs.readFile(res.chromoriPath, "utf8");
    } catch (e) {}

    const patchedFile = patches[baseName](file);
    res.send(patchedFile);
  } else {
    try {
      const stat = await fs.stat(res.chromoriPath);
      if (stat.isFile()) {
        res.contentType("text/plain");
        nfs.createReadStream(res.chromoriPath).pipe(res);
      } else {
        throw new Error();
      }
    } catch (e) {
      res.status(404).send("ENOENT");
    }
  }
});

app.all("/writeFile", async (req, res) => {
  try {
    await fs.writeFile(res.chromoriPath, req.body);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

app.all("/readDir", async (req, res) => {
  try {
    res.send((await fs.readdir(res.chromoriPath)).join(":"));
  } catch (e) {
    res.send("ENOENT");
  }
});

app.all("/mkDir", async (req, res) => {
  try {
    await fs.mkdir(res.chromoriPath);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

app.all("/unlink", async (req, res) => {
  try {
    await fs.unlink(res.chromoriPath);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

module.exports = app;
