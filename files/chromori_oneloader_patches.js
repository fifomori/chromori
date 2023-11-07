if (typeof $modLoader !== "undefined") {
  // Copied from OneLoader
  function _vfs_resolve_file_path(relativePath) {
    relativePath = relativePath.toLowerCase();
    let dirTree = _overlay_fs_split_path(relativePath);
    let currentDir = $modLoader.overlayFS;
    let fileName = dirTree.pop();

    if (/\%[0-9A-Fa-f]{2,}/.test(fileName)) {
      try {
        window._logLine("Trying to decode URI component");
        fileName = decodeURIComponent(fileName);
        window._logLine("Decoded URI component for " + fileName);
      } catch (e) {}
    }

    let bail = false;
    let entry;
    while (dirTree.length > 0) {
      let nextDepth = dirTree.shift();
      if (currentDir[nextDepth] && currentDir[nextDepth].children) {
        currentDir = currentDir[nextDepth].children;
      } else {
        bail = true;
        break;
      }
    }

    if (!bail) {
      if (currentDir[fileName] && currentDir[fileName].type !== "dir") {
        entry = currentDir[fileName];
      } else {
        bail = true;
      }
    }

    return entry;
  }

  XMLHttpRequest = class extends XMLHttpRequest {
    open(method, url, async) {
      if (typeof async === "undefined") this._chromori_async = true;
      else this._chromori_async = async;

      this._chromori_url = url;

      return super.open(...arguments);
    }

    send() {
      if (!this._chromori_url.startsWith(chromori.url)) {
        let entry = _vfs_resolve_file_path(this._chromori_url);
        if (entry) {
          this._chromori_responseHook = true;
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
      if (!this._chromori_responseHook) return super.response;

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
  };
}
