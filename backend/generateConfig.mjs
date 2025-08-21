import p from "child_process";
import path from "path";
import { getDefaultPaths } from "./utils.mjs";

// https://stackoverflow.com/a/48480895
function parseArgv(str) {
    return str.split(" ").reduce(
        (accum, curr) => {
            if (accum.isConcatting) {
                accum.soFar[accum.soFar.length - 1] += " " + curr;
            } else {
                accum.soFar.push(curr);
            }
            if (curr.split('"').length % 2 == 0) {
                accum.isConcatting = !accum.isConcatting;
            }
            return accum;
        },
        { soFar: [], isConcatting: false }
    ).soFar;
}

const KEY_REGEX = /^[A-Za-z0-9]+$/g;

// TODO unify
export default {
    async win32() {
        const wmic = p.spawnSync("wmic", "process where Caption='OMORI.exe' get CommandLine".split(" "), {
            encoding: "ascii",
        });
        if (wmic.stderr || wmic.error) {
            throw wmic.stderr;
        }

        const commandLines = wmic.stdout
            .split("\n")
            .slice(1) // remove wmic's first line "CommandLine"
            .map((l) => l.trim()) // fix wmic weird newlines and tabs
            .filter(Boolean); // remove empty lines

        const result = { key: undefined, gamePath: getDefaultPaths("win32").root };

        for (const commandLine of commandLines) {
            const argv = parseArgv(commandLine);

            argv.forEach((arg, i) => {
                if (i == 0 && arg.endsWith("OMORI.exe")) {
                    result.gamePath = path.dirname(arg);
                } else if (arg.startsWith("--")) {
                    const key = arg.replace("--", "");
                    if (key.length == 32 && key.match(KEY_REGEX)) {
                        result.key = key;
                    }
                }
            });
        }

        return result;
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
