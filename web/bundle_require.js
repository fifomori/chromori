const jsYaml = require("js-yaml");
jsYaml.safeDump = jsYaml.dump;
jsYaml.safeLoad = jsYaml.load;
jsYaml.safeLoadAll = jsYaml.loadAll;

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
  "./js/libs/js-yaml-master": jsYaml,
};
