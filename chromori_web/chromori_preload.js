// const __fpsMeterScript = document.createElement("script");
// __fpsMeterScript.type = "text/javascript";
// __fpsMeterScript.src = "js/libs/fpsmeter.js";

// if (document.head) document.head.appendChild(__fpsMeterScript);
// else if (document.body) document.body.appendChild(__fpsMeterScript);

var global = globalThis;

global.process = {
  env: JSON.parse(chromori.fetchSync("/env")),
  versions: { nw: "0.29.0" },
};

process.platform = process.env._PLATFORM;
process.cwd = () => process.env._DIRNAME;
