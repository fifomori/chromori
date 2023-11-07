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

app.all("/stat", async (req, res) => {
  try {
    const stat = await fs.stat(res.chromoriPath);
    res.send(stat.isFile() ? "file" : "dir");
  } catch (e) {
    res.send(ERRNO_ENOENT);
  }
});

app.all("/rename", async (req, res) => {
  try {
    await fs.rename(res.chromoriPath, req.body);
  } catch (e) {}
  res.status(200).end();
});

const greenworks = require("./greenworks/greenworks");
const fallbackAchievements = require("./achievements.json");

if (!nfs.existsSync("./activatedAchievements.json")) {
  nfs.writeFileSync("./activatedAchievements.json", "{}");
}

const activatedAchievements = require("./activatedAchievements.json");

let greenworksInit = false;
try {
  greenworksInit = greenworks.init();
  console.log("Connected to Steam");
} catch (e) {
  console.log("Cannot connect to Steam, using fallback achievements method");
}

app.all("/steamworks/achievements/init", async (req, res) => {
  res.send({ result: greenworksInit });
});

app.all("/steamworks/achievements/count", async (req, res) => {
  if (greenworksInit) {
    res.send({ number: greenworks.getNumberOfAchievements() });
  } else {
    res.send({ number: Object.keys(fallbackAchievements).length });
  }
});

app.all("/steamworks/achievements/list", async (req, res) => {
  if (greenworksInit) {
    res.send({ achievements: greenworks.getAchievementNames() });
  } else {
    res.send({ achievements: Object.keys(fallbackAchievements) });
  }
});

app.all("/steamworks/achievements/get", async (req, res) => {
  if (greenworksInit) {
    greenworks.getAchievement(
      res.chromoriPath,
      (isAchieved) => {
        res.send({ result: isAchieved });
      },
      (e) => {
        console.error(`greenworks.getAchievement failed: ${e}`);
        res.send({ result: false });
      }
    );
  } else {
    res.send({ result: !!activatedAchievements[res.chromoriPath] });
  }
});

app.all("/steamworks/achievements/info", async (req, res) => {
  if (res.chromoriPath in fallbackAchievements) {
    res.send(fallbackAchievements[res.chromoriPath]);
  } else {
    console.error("fallback getAchievementInfo failed: Achievement name is not valid");
    res.send({});
  }
});

app.all("/steamworks/achievements/activate", async (req, res) => {
  if (greenworksInit) {
    greenworks.activateAchievement(
      res.chromoriPath,
      () => {
        res.send({ result: true });
      },
      (e) => {
        console.error(`greenworks.activateAchievement failed: ${e}`);
        res.send({ result: false });
      }
    );
  } else {
    if (res.chromoriPath in fallbackAchievements) {
      activatedAchievements[res.chromoriPath] = true;
      await fs.writeFile("./activatedAchievements.json", JSON.stringify(activatedAchievements));
      res.send({ result: true });
    } else {
      console.error("fallback activateAchievement failed: Achievement name is not valid");
      res.send({ result: false });
    }
  }
});

module.exports = app;
