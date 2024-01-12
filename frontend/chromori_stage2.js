process.mainModule = {
    filename: require("path").join(process.cwd(), process.env._CONFIG.gameDirectory, "index.html"),
};

globalThis.Buffer = require("buffer").Buffer;
