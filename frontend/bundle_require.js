const jsYaml = require("js-yaml");

module.exports = {
    buffer: require("buffer"),
    crypto: require("crypto-browserify"),
    events: require("events"),
    stream: require("stream"),
    util: require("util"),
    zlib: require("browserify-zlib"),
    fs: require("./require_fs"),
    path: require("./require_path"),
    "./js/libs/greenworks": require("./require_greenworks"),
};

module.exports["./js/libs/js-yaml-master"] = {
    ...jsYaml,
    safeDump: jsYaml.dump,
    safeLoad: jsYaml.load,
    safeLoadAll: jsYaml.loadAll,
};

module.exports["os"] = {
    platform: () => process.platform,
};

module.exports["nw.gui"] = window.nw = {
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
                isFullscreen: false,
                x: window.screenX,
                y: window.screenY,
                enterFullscreen: () => {},
                leaveFullscreen: () => {},
                showDevTools: () => {},
                closeDevTools: () => {},
                moveTo: () => {},
                on: () => {},
                focus: () => {},
            };
        },
    },
    Menu: class {
        constructor() {
            this.createMacBuiltin = () => {};
        }
    },
};
