import p from "child_process";

// TODO: common code to function
export default {
    win32() {
        const wmic = p.spawnSync("wmic", "process where caption='OMORI.exe' get commandline".split(" "), {
            encoding: "ascii",
        });
        if (wmic.stderr) {
            return null;
        }

        try {
            // splitted in lines for easy debugging
            let key = wmic.stdout;
            key = key.split("\n"); // split
            key = key.slice(1); // remove wmic's first line "CommandLine"
            key = key.map((l) => l.trim()); // fix wmic weird newlines and tabs
            key = key.filter(Boolean); // remove empty lines
            key = key.map((l) => l.split(" ")); // split lines into array of args (don't care about ' ' in paths)
            key = key.map((l) => l.filter((l) => l.startsWith("--"))); // only --args
            key = [].concat(...key); // convert to flat array
            key = key.map((l) => l.replace("--", "")); // remove -- from all args
            key = key.filter((l) => l.length == 32 && l.match(/^[A-Za-z0-9]+$/g)); // omori's decryption key is alphanumeric and 32 bytes long
            key = key.pop(); // and finally get it

            return key;
        } catch (e) {
            console.error("An error happened while getting decryption key");
            console.error(e);
            return null;
        }
    },
    darwin() {
        const ps = p.spawnSync("ps", "-e -o command".split(" "), {
            encoding: "ascii",
        });
        if (ps.stderr) {
            return null;
        }

        try {
            // splitted in lines for easy debugging
            let key = ps.stdout;
            key = key.split("\n"); // split
            key = key.slice(1); // remove ps's first line "COMMAND"
            key = key.map((l) => l.trim()); // just in case
            key = key.map((l) => l.split(" ")); // split lines into array of args (don't care about ' ' in paths)
            key = key.map((l) => l.filter((l) => l.startsWith("--") && l.includes("nwjs"))); // only --args
            key = [].concat(...key); // convert to flat array
            key = key.map((l) => l.replace("--", "")); // remove -- from all args
            key = key.filter((l) => l.length == 32 && l.match(/^[A-Za-z0-9]+$/g)); // omori's decryption key is alphanumeric and 32 bytes long
            key = key.pop(); // and finally get it

            return key;
        } catch (e) {
            console.error("An error happened while getting decryption key");
            console.error(e);
            return null;
        }
    },
};
