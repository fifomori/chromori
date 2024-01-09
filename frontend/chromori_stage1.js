(() => {
    const env = JSON.parse(chromori.fetchSync("/env").res);
    globalThis.process = {
        env,
        versions: { nw: "0.29.0" },
        platform: env._PLATFORM,
        cwd: () => env._CWD,
    };
})();
