process.mainModule = {
    filename: require("path").join(process.cwd(), "www", "index.html"),
};

globalThis.Buffer = require("buffer").Buffer;
