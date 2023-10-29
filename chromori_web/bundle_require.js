module.exports = {
  buffer: require("buffer"),
  crypto: require("crypto-browserify"),
  events: require("events"),
  fs: require("./chromori_fs"),
  path: require("./chromori_path"),
  stream: require("stream"),
  util: require("util"),
  zlib: require("browserify-zlib"),
  "./js/libs/js-yaml-master": require("js-yaml"),
};
