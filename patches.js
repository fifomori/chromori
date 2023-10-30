const fs = require("fs");
const crypto = require("crypto");
const { JSDOM } = require("jsdom");
const DOMParser = new JSDOM().window.DOMParser;

module.exports = {
  "index.html"(file) {
    const patches = [
      "chromori",
      "chromori_preload", //
      "bundle",
      "require_cache",
      "chromori_postload",
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
    return (
      file +
      '\n$plugins.unshift({ name: "chromori_oneloader_patches", status: true, description: "chromori oneloader patches", parameters: {} })' +
      '\n$plugins.push({ name: "chromori_plugins_patches", status: true, description: "chromori plugins patches", parameters: {} })'
    );
  },
  "chromori_plugins_patches.omori"() {
    // Even though this is a unlink from Steam, the key is still required to boot
    const file = `Scene_Boot = class extends Scene_Boot {
      hasSteamwork() {
        return true;
      }
      getAchievementsData() {
        return;
      }
    };`;

    // copied from OneLoader
    const iv = Buffer.from("EpicGamerMoment!");
    const cipherStream = crypto.createCipheriv(
      "aes-256-ctr",
      fs.readFileSync("key", { encoding: "ascii" }),
      iv
    );
    return Buffer.concat([
      iv,
      cipherStream.update(Buffer.from(file, "utf8")),
      cipherStream.final(),
    ]);
  },
  "chromori_oneloader_patches.omori"() {
    const file = `if ($modLoader) {
      XMLHttpRequest = class extends XMLHttpRequest {
        open(method, url, async) {
          if (typeof async === "undefined") this._chromori_async = true;
          else this._chromori_async = async;

          this._chromori_url = url;

          return super.open(...arguments);
        }

        send() {
          if (!this._chromori_url.startsWith(chromori.url)) {
            let [bail, relativePath, entry] = _vfs_resolve_file_path(this._chromori_url);
            if (entry) {
              this._chromori_resourceHook = true;
              setTimeout(() => {
                if (this.onload) this.onload();
                // this.dispatchEvent(new Event("load"));
              }, 1);
              return;
            }
          }

          return super.send(...arguments);
        }

        get response() {
          if (!this._chromori_resourceHook) return super.response;

          try {
            let data = _vfs_resolve_file_sync(this._chromori_url);
            if (this.responseType === "arraybuffer") {
              return data.buffer;
            } else {
              return data;
            }
          } catch (e) {
            console.error(e);
            return super.response;
          }
        }
      }
    }`;

    // copied from OneLoader
    const iv = Buffer.from("EpicGamerMoment!");
    const cipherStream = crypto.createCipheriv(
      "aes-256-ctr",
      fs.readFileSync("key", { encoding: "ascii" }),
      iv
    );
    return Buffer.concat([
      iv,
      cipherStream.update(Buffer.from(file, "utf8")),
      cipherStream.final(),
    ]);
  },
};
