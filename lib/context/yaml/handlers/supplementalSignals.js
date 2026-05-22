"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parseAndDump(context) {
    const { supplementalSignals } = context.assets;
    if (!supplementalSignals)
        return { supplementalSignals: null };
    return {
        supplementalSignals,
    };
}
const supplementalSignalsHandler = {
    parse: parseAndDump,
    dump: parseAndDump,
};
exports.default = supplementalSignalsHandler;
