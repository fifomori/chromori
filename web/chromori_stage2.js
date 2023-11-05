process.mainModule = {
  filename: require("path").join(process.env._DIRNAME, "www", "index.html"),
};

global.Buffer = require("buffer").Buffer;
