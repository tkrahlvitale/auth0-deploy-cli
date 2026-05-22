"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parse(context) {
    const { rulesConfigs } = context.assets;
    if (!rulesConfigs)
        return { rulesConfigs: null };
    return {
        rulesConfigs,
    };
}
async function dump(context) {
    const { rulesConfigs } = context.assets;
    if (!rulesConfigs)
        return { rulesConfigs: null };
    return {
        rulesConfigs: [], // even if they exist, do not export rulesConfigs as its values cannot be extracted
    };
}
const rulesConfigsHandler = {
    parse,
    dump,
};
exports.default = rulesConfigsHandler;
