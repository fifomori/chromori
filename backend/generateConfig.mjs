import p from "child_process";
import path from "path";
import { getDefaultPaths } from "./utils.mjs";

export default {
    async win32() {
        const wmi = (await import("@intelcorp/wmi-native-module")).default;

        const properties = ["CommandLine", "ExecutablePath"];
        const query = `SELECT ${properties.join(",")} FROM Win32_Process WHERE Caption='OMORI.exe'`;
        const result = wmi.query("root/cimv2", query, properties);

        for (const entry of Object.values(result)) {
            if (typeof entry.CommandLine !== "string" || typeof entry.ExecutablePath !== "string") continue;
            const arg = entry.CommandLine.split(" ").find((v) => {
                return (
                    v.startsWith("--") &&
                    v.slice(2).match(/^[A-Za-z0-9]+$/g) && // alphanumeric
                    v.length == 34 // '--' + 32 bytes key
                );
            });

            if (arg) {
                const key = arg.slice(2);
                const gamePath = path.parse(entry.ExecutablePath).dir;

                return { key, gamePath };
            }
        }
        return null;
    },
    async darwin() {
        const ps = p.spawnSync("ps", "-e -o command".split(" "), {
            encoding: "ascii",
        });
        if (ps.stderr || ps.error) {
            throw ps.stderr;
        }

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

        // TODO: support for gamePath
        return { key, gamePath: getDefaultPaths("darwin").root };
    },
};
