/// <reference path="intellisense.d.ts"/>

/**
 * @type {Chromori}
 */
const chromori = {
    fetch: function (method, path, callback, options = { type: undefined, data: undefined, json: false }) {
        const xhr = new XMLHttpRequest();
        if (options.type) xhr.responseType = options.type;

        xhr.open("POST", this.apiUrl + method, true);
        xhr.setRequestHeader("x-chromori-path", path);
        xhr.addEventListener("load", () => {
            if (xhr.status != 200) {
                callback(xhr.status);
            } else if (options.json) {
                callback(xhr.status, JSON.parse(xhr.response));
            } else {
                callback(xhr.status, xhr.response);
            }
        });
        xhr.send(options.data);
    },

    fetchSync: function (method, path, options = { mime: undefined, data: undefined, json: false }) {
        const xhr = new XMLHttpRequest();
        if (options.mime) xhr.overrideMimeType(options.mime);

        xhr.open("POST", this.apiUrl + method, false);
        xhr.setRequestHeader("x-chromori-path", encodeURIComponent(path));
        xhr.send(options.data);

        if (xhr.status != 200) {
            return { status: xhr.status };
        } else if (options.json) {
            return { status: xhr.status, res: JSON.parse(xhr.response) };
        } else {
            return { status: xhr.status, res: xhr.response };
        }
    },

    decoder: new TextDecoder(),
    encoder: new TextEncoder(),
    apiUrl: `http://${window.location.hostname}:80/api`,

    createAchievementElement: function (name, description, icon, id) {
        const el = document.createElement("div");
        el.className = "chromori_achievement";
        el.id = id;
        el.innerHTML = `<div class="chromori_achievement_icon" style="background-image: url(${icon})"></div>
            <div class="chromori_achievement_text">
            <div class="chromori_achievement_name">${name}</div>
            <div class="chromori_achievement_desc">${description}</div>
            </div>`;
        return el;
    },
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

        function evalInScope(js, contextAsScope) {
            return function () {
                with (this) {
                    return eval(js);
                }
            }.call(contextAsScope);
        }

        const context = { module: { exports: {} } };
        evalInScope(chromori.decoder.decode(file), context);
        return context.module.exports;
    }

    if (!module) {
        console.error(`[nwcompat:require] module '${id}' not found`);
    }
    return module;
};
