"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const utils_1 = require("../../../utils");
function parse(context) {
    const baseFolder = path_1.default.join(context.filePath);
    if (!(0, utils_1.existsMustBeDir)(baseFolder))
        return { supplementalSignals: null }; // Skip
    const supplementalSignalsFile = path_1.default.join(baseFolder, 'supplemental-signals.json');
    if (!(0, utils_1.isFile)(supplementalSignalsFile)) {
        return { supplementalSignals: null };
    }
    const supplementalSignals = (0, utils_1.loadJSON)(supplementalSignalsFile, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    });
    return {
        supplementalSignals,
    };
}
async function dump(context) {
    const { supplementalSignals } = context.assets;
    if (!supplementalSignals)
        return; // Skip, nothing to dump
    const supplementalSignalsFile = path_1.default.join(context.filePath, 'supplemental-signals.json');
    (0, utils_1.dumpJSON)(supplementalSignalsFile, supplementalSignals);
}
exports.default = {
    parse,
    dump,
};
