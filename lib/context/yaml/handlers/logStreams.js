"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaults_1 = require("../../defaults");
async function parse(context) {
    const { logStreams } = context.assets;
    if (!logStreams)
        return { logStreams: null };
    return {
        logStreams,
    };
}
async function dump(context) {
    const { logStreams } = context.assets;
    if (!logStreams)
        return { logStreams: null };
    // masked sensitive fields
    const maskedLogStreams = (0, defaults_1.logStreamDefaults)(logStreams);
    return {
        logStreams: maskedLogStreams,
    };
}
const logStreamsHandler = {
    parse: parse,
    dump: dump,
};
exports.default = logStreamsHandler;
