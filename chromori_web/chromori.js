const chromori = {
  // TODO: options common type
  /**
   * @param {string} path
   * @param {(res: any) => void} callback
   * @param {{
   *  type: XMLHttpRequestResponseType,
   *  data: any
   * }} options
   */
  fetch: function (method, path, callback, options = { type: undefined, data: undefined }) {
    const xhr = new XMLHttpRequest();
    if (options.type) xhr.responseType = options.type;

    xhr.open("POST", this.url + method, true);
    xhr.setRequestHeader("x-chromori-path", path);
    xhr.addEventListener("load", () => callback(xhr.response));
    xhr.send(options.data);
  },

  /**
   * @param {string} path
   * @param {{
   *  mime: string,
   *  data: XMLHttpRequestBodyInit
   * }} options
   */
  fetchSync: function (method, path, options = { mime: undefined, data: undefined }) {
    const xhr = new XMLHttpRequest();
    if (options.mime) xhr.overrideMimeType(options.mime);

    xhr.open("POST", this.url + method, false);
    xhr.setRequestHeader("x-chromori-path", path);
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
