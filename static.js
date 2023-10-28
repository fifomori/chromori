const pp = require("path");
const nfs = require("fs");
const fs = nfs.promises;

const express = require("express");
const { JSDOM } = require("jsdom");
const DOMParser = new JSDOM().window.DOMParser;

const app = express();
app.set("etag", false);
app.use((req, res, next) => {
  res.header("Cache-Control", "no-store");
  next();
});

const chromoriPatches = [
  "chromori", //
  "fixes",
  "bundle",
  "chromori_fs",
  "chromori_misc",
].reverse();

app.use("/chromori", express.static("chromori_web"));
app.use("/", async (req, res) => {
  let path = pp.join(__dirname, "www", req.url);
  if (path.endsWith(pp.sep)) path += "index.html";

  try {
    path = decodeURIComponent(path);
  } catch (e) {}

  if (pp.basename(path) == "index.html") {
    const html = await fs.readFile(path);
    const doc = new DOMParser().parseFromString(html, "text/html");

    for (const patch of chromoriPatches) {
      const script = doc.createElement("script");
      script.type = "text/javascript";
      script.src = `chromori/${patch}.js`;
      if (doc.head) doc.head.insertBefore(script, doc.head.firstChild);
      else if (doc.body) doc.body.insertBefore(script, doc.body.firstChild);
      else throw new Error("Failed to patch index.html");
    }

    console.log(`static: ${req.url} ('${path}'): index`);

    res.send(doc.documentElement.innerHTML);
    return;
  }

  try {
    const stat = await fs.stat(path);
    if (stat.isFile()) {
      console.log(`static: ${req.url} ('${path}'): found`);

      if (pp.extname(path) == ".wasm") res.contentType("application/wasm");
      nfs.createReadStream(path).pipe(res);
      return;
    }
  } catch (e) {}

  console.log(`static: ${req.url} ('${path}'): ENOENT`);
  res.send("ENOENT");
});

module.exports = app;
