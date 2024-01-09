const { JSDOM } = require("jsdom");
const DOMParser = new JSDOM().window.DOMParser;

module.exports = {
    "/index.html": {
        type: "custom",
        async patch(file) {
            const patches = [
                "chromori_stage0", //
                "chromori_stage1",
                "bundle",
                "require_cache",
                "chromori_stage2",
            ].reverse();

            const doc = new DOMParser().parseFromString(file, "text/html");

            for (const patch of patches) {
                const script = doc.createElement("script");
                script.type = "text/javascript";
                script.src = `chromori/${patch}.js`;
                // TODO: ?
                if (doc.head) doc.head.insertBefore(script, doc.head.firstChild);
                else if (doc.body) doc.body.insertBefore(script, doc.body.firstChild);
                else throw new Error("Failed to patch index.html");
            }

            return doc.documentElement.innerHTML;
        },
    },
    "early_loader.js": {
        type: "custom",
        async patch(file) {
            return (
                file
                    // Throw all errors so you can debug it in DevTools
                    .replace("run().catch(e => {", "run(); /*")
                    .replace("    });\n})();", "*/})();")
                    // Don't install DevTools vfs
                    .replace("await _modLoader_install_debugger_vfs", "//")
            );
        },
    },
    "logging.js": {
        type: "replace",
        content: "window._logLine = console.warn",
    },
    "/js/plugins.js": {
        type: "merge",
        fileName: "plugins.js",
        merge(original, custom) {
            return original + custom;
        },
    },
    "/js/plugins/chromori_oneloader_patches.omori": {
        type: "replace",
        fileName: "chromori_oneloader_patches.js",
        encrypt: true,
    },
    "/js/plugins/chromori_plugins_patches.omori": {
        type: "replace",
        fileName: "chromori_plugins_patches.js",
        encrypt: true,
    },
};
