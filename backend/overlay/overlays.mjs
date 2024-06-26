import { JSDOM } from "jsdom";
const DOMParser = new JSDOM().window.DOMParser;

export default {
    "/index.html": {
        type: "custom",
        async patch(file) {
            const files = [
                "chromori_stage0", // chromori object and require method
                "chromori_stage1", // node-specific objects from /api/env
                "bundle", // import modules for require
                "chromori_stage2", // node-specific objects that depend on modules
            ].reverse();

            const doc = new DOMParser().parseFromString(file, "text/html");

            for (const file of files) {
                const script = doc.createElement("script");
                script.type = "text/javascript";
                script.src = `chromori/${file}.js`;
                // TODO: ?
                if (doc.head) doc.head.insertBefore(script, doc.head.firstChild);
                else if (doc.body) {
                    console.warn("Failed to patch head, patching body");
                    doc.body.insertBefore(script, doc.body.firstChild);
                } else throw "Failed to patch index.html";
            }

            return doc.documentElement.innerHTML;
        },
    },
    "/js/plugins.js": {
        type: "merge",
        fileName: "plugins.js",
        merge(original, custom) {
            return `${original};${custom}`;
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
    // OneLoader playtest mode
    "/js/plugins/chromori_oneloader_patches.js": {
        type: "replace",
        fileName: "chromori_oneloader_patches.js",
    },
    "/js/plugins/chromori_plugins_patches.js": {
        type: "replace",
        fileName: "chromori_plugins_patches.js",
    },
    "/modloader/early_loader.js": {
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
    "/modloader/logging.js": {
        type: "replace",
        content: "window._logLine = console.warn",
    },
};
