process.platform = process.env._PLATFORM;
process.versions = { nw: "0.29.0" };
process.mainModule = {
  filename: require("path").join(process.env._DIRNAME, "www", "index.html"),
};

__requireCache["os"] = {
  platform: () => process.platform,
};

__requireCache["nw.gui"] = window.nw = {
  App: {
    argv: [`--${process.env._KEY}`],
  },
  Screen: {
    Init: () => {},
    on: () => {},
  },
  Window: {
    get: () => {
      return {
        showDevTools: () => {},
        on: () => {},
      };
    },
  },
};

globalThis.Buffer = require("buffer").Buffer;
