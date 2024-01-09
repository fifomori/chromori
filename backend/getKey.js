const p = require("child_process");

module.exports = {
    // TODO: unix support
    windows() {
        const wmic = p.spawnSync(
            "wmic",
            ["process", "where", "caption='OMORI.exe'", "get", "commandline"],
            { encoding: "ascii" }
        );
        if (wmic.stderr) {
            return null;
        }

        try {
            // i dont know what did i wrote
            const key = []
                .concat(
                    ...wmic.stdout
                        .replace(/\r/g, "")
                        .split("\n")
                        .slice(1)
                        .map((l) => l.trim())
                        .filter(Boolean)
                        .map((l) => l.split(" "))
                        .map((l) => l.filter((l) => l.startsWith("--")))
                )
                .map((l) => l.replace("--", ""))
                .filter((l) => l.length == 32)
                .pop();

            return key;
        } catch (e) {
            console.error("An error happened while getting decryption key");
            console.error(e);
            return null;
        }
    },
};
