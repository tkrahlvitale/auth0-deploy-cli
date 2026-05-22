"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaults_1 = require("../../defaults");
async function parse(context) {
    const { phoneTemplates } = context.assets;
    if (!phoneTemplates)
        return { phoneTemplates: null };
    return {
        phoneTemplates,
    };
}
async function dump(context) {
    const { phoneTemplates } = context.assets;
    if (!phoneTemplates)
        return { phoneTemplates: null };
    const processedTemplates = phoneTemplates.map((template) => (0, defaults_1.phoneTemplatesDefaults)(template));
    return {
        phoneTemplates: processedTemplates,
    };
}
const phoneTemplatesHandler = {
    parse,
    dump,
};
exports.default = phoneTemplatesHandler;
