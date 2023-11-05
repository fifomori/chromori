const pp = require("path");
const nfs = require("fs");
const fs = nfs.promises;

const express = require("express");
const patches = require("./patches");

const ERRNO_ENOENT = "ENOENT";

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
  res.chromoriPath = decodeURIComponent(req.headers["x-chromori-path"]);
  next();
});

app.use(express.raw({ inflate: true, limit: "50mb", type: () => true }));

app.all("/env", async (req, res) => {
  let argv = [];
  try {
    argv = await fs.readFile("argv", { encoding: "ascii" });
    argv = argv.split(" ");
    if (!argv[0]) argv = [];
  } catch (e) {}

  res.send({
    LOCALAPPDATA: process.env.LOCALAPPDATA,
    HOME: process.env.HOME,
    _PLATFORM: process.platform,
    _DIRNAME: __dirname,
    _ARGV: [
      `--${await fs.readFile("key", { encoding: "ascii" })}`, //
      ...argv,
    ],
  });
});

app.all("/stat", async (req, res) => {
  try {
    const stat = await fs.stat(res.chromoriPath);
    res.send(stat.isFile() ? "file" : "dir");
  } catch (e) {
    res.send(ERRNO_ENOENT);
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
      // FIXME: file can contain "ENOENT" text and this will cause an ENOENT error
      res.send(ERRNO_ENOENT);
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

// TODO: json maybe
app.all("/readDir", async (req, res) => {
  try {
    res.send((await fs.readdir(res.chromoriPath)).join(":"));
  } catch (e) {
    res.send(ERRNO_ENOENT);
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

const greenworks = require("./greenworks/greenworks");

let greenworksInit = false;
try {
  greenworksInit = greenworks.init();
  console.log("Connected to Steam");
} catch (e) {
  console.log("Cannot connect to Steam, achievements will not work");
}

app.all("/steamworks/achievements/count", async (req, res) => {
  let number = 0;
  if (greenworksInit) number = greenworks.getNumberOfAchievements();
  res.send({ number });
});

app.all("/steamworks/achievements/list", async (req, res) => {
  let achievements = [];
  if (greenworksInit) achievements = greenworks.getAchievementNames();
  res.send({ achievements });
});

app.all("/steamworks/achievements/get", async (req, res) => {
  if (greenworksInit) {
    greenworks.getAchievement(res.chromoriPath, (isAchieved) => {
      res.send({ result: isAchieved });
    });
  } else {
    res.send({ result: false });
  }
});

app.all("/steamworks/achievements/activate", async (req, res) => {
  if (greenworksInit) {
    greenworks.activateAchievement(
      res.chromoriPath,
      () => res.send({ result: true }),
      () => res.send({ result: false })
    );
  } else {
    res.send({ result: false });
  }
});

module.exports = app;
