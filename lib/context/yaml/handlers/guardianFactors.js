"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../tools/utils");
async function parseAndDump(context) {
    let { guardianFactors } = context.assets;
    if (!guardianFactors)
        return { guardianFactors: null };
    guardianFactors = (0, utils_1.sortGuardianFactors)(guardianFactors);
    return {
        guardianFactors,
    };
}
const guardianFactorsHandler = {
    parse: parseAndDump,
    dump: parseAndDump,
};
exports.default = guardianFactorsHandler;
