const chromori = {
  /**
   * @param {string} path
   * @param {(res: any) => void} callback
   * @param {{
   *  method: string,
   *  type: XMLHttpRequestResponseType,
   *  data: XMLHttpRequestBodyInit
   * }} options
   */
  fetch: function (path, callback, options = { type: undefined, data: undefined }) {
    const xhr = new XMLHttpRequest();
    if (options.type) xhr.responseType = options.type;
    xhr.open(options.data ? "POST" : "GET", this.url + path, true);
    xhr.onload = () => callback(xhr.response);
    xhr.send(options.data);
  },

  // TODO: options common type
  /**
   * @param {string} path
   * @param {{
   *  method: string,
   *  mime: string,
   *  data: XMLHttpRequestBodyInit
   * }} options
   */
  fetchSync: function (path, options = { mime: undefined, data: undefined }) {
    const xhr = new XMLHttpRequest();
    if (options.mime) xhr.overrideMimeType(options.mime);
    xhr.open(options.data ? "POST" : "GET", this.url + path, false);
    xhr.send(options.data);
    return xhr.response;
  },

  decoder: new TextDecoder(),
  encoder: new TextEncoder(),
  url: "http://localhost:8080",
};

/**
 * @param {string} id
 */
globalThis.require = (id) => {
  let module = __requireCache[id];

  // hacky
  if (id.startsWith("./modloader")) {
    const fs = require("fs");
    const pp = require("path");
    // OneLoader
    const file = fs.readFileSync(pp.join(pp.dirname(process.mainModule.filename), id));

    function evalInContext(js, context) {
      return function (str) {
        return eval(str);
      }.call(context, "with(this) { " + js + " }");
    }

    let context = { module: { exports: {} } };
    evalInContext(Buffer.from(file), context);
    return context;
  }

  if (!module) {
    console.error(`[nwcompat:require] module '${id}' not found`);
  }
  return module;
};
