__requireCache["os"] = {
  platform: () => process.platform,
};

__requireCache["nw.gui"] = window.nw = {
  App: {
    argv: process.env._ARGV,
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
