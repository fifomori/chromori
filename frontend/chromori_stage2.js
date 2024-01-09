process.mainModule = {
    filename: require("path").join(process.cwd(), "www", "index.html"),
};

// TODO: why not globalThis
global.Buffer = require("buffer").Buffer;
