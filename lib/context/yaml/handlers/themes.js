"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parseAndDump(context) {
    const { themes } = context.assets;
    if (!themes)
        return { themes: null };
    return {
        themes,
    };
}
const themesHandler = {
    parse: parseAndDump,
    dump: parseAndDump,
};
exports.default = themesHandler;
