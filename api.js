const pp = require("path");
const nfs = require("fs");
const fs = nfs.promises;

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set("etag", false);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cache-Control", "no-store");
  next();
});

app.use((req, res, next) => {
  const url = decodeURIComponent(req.url.slice(1)).split("^");
  const method = url.shift();
  req.chromoriPath = url.shift();

  console.log("api:", method, req.chromoriPath || "");
  next();
});

app.use(bodyParser.raw({ inflate: true, limit: "50mb", type: () => true }));

app.all("/env", async (req, res) => {
  res.send(
    JSON.stringify({
      LOCALAPPDATA: process.env.LOCALAPPDATA,
      HOME: process.env.HOME,
      _PLATFORM: process.platform,
      _DIRNAME: __dirname,
      _KEY: await fs.readFile("key", { encoding: "ascii" }),
    })
  );
});

app.all("/stat*", async (req, res) => {
  let path = req.chromoriPath;

  try {
    const stat = await fs.stat(path);
    res.send(stat.isFile() ? "file" : "dir");
  } catch (e) {
    res.send("ENOENT");
  }
});

app.all("/readFile*", async (req, res) => {
  let path = req.chromoriPath;

  try {
    const stat = await fs.stat(path);
    if (stat.isFile()) {
      res.contentType("text/plain");
      nfs.createReadStream(path).pipe(res);
    }
  } catch (e) {
    res.send("ENOENT");
  }
});

app.all("/writeFile*", async (req, res) => {
  let path = req.chromoriPath;

  try {
    await fs.writeFile(path, req.body);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

app.all("/readDir*", async (req, res) => {
  let path = req.chromoriPath;

  try {
    res.send((await fs.readdir(path)).join(":"));
  } catch (e) {
    res.send("ENOENT");
  }
});

app.all("/mkDir*", async (req, res) => {
  let path = req.chromoriPath;

  try {
    await fs.mkdir(path);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

module.exports = app;
