// TODO: ?
var global = globalThis;

globalThis.process = {
    env: JSON.parse(chromori.fetchSync("/env").res),
    versions: { nw: "0.29.0" },
};

process.platform = process.env._PLATFORM;
process.cwd = () => process.env._CWD;
