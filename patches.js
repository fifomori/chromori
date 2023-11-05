const fs = require("fs");
const pp = require("path");
const utils = require("./utils");

const { JSDOM } = require("jsdom");
const DOMParser = new JSDOM().window.DOMParser;

module.exports = {
  "index.html"(file) {
    const patches = [
      "chromori_stage0", //
      "chromori_stage1",
      "bundle",
      "require_cache",
      "chromori_stage2",
    ].reverse();

    const doc = new DOMParser().parseFromString(file, "text/html");

    for (const patch of patches) {
      const script = doc.createElement("script");
      script.type = "text/javascript";
      script.src = `chromori/${patch}.js`;
      if (doc.head) doc.head.insertBefore(script, doc.head.firstChild);
      else if (doc.body) doc.body.insertBefore(script, doc.body.firstChild);
      else throw new Error("Failed to patch index.html");
    }

    return doc.documentElement.innerHTML;
  },
  "early_loader.js"(file) {
    // Throw all errors so you can debug it in DevTools
    return file
      .replace("run().catch(e => {", "run(); /*")
      .replace("    });\n})();", "*/})();")
      .replace("await _modLoader_install_debugger_vfs", "//");
  },
  "logging.js"() {
    return "window._logLine = console.warn";
  },
  "plugins.js"(file) {
    return file + fs.readFileSync(pp.join("files", "plugins.js"));
  },
  "chromori_oneloader_patches.omori"() {
    return utils.encrypt(fs.readFileSync(pp.join("files", "chromori_oneloader_patches.js")));
  },
};
