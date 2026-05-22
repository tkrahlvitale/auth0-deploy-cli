"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parse(context) {
    // Load the script file for each action
    if (!context.assets.triggers)
        return { triggers: null };
    return {
        triggers: context.assets.triggers,
    };
}
async function dump(context) {
    const { triggers } = context.assets;
    // Nothing to do
    if (!triggers)
        return { triggers: null };
    return {
        triggers: triggers,
    };
}
const triggersHandler = {
    parse,
    dump,
};
exports.default = triggersHandler;
