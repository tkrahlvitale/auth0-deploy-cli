"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../../logger"));
async function parse(context) {
    const { networkACLs } = context.assets;
    if (!networkACLs)
        return { networkACLs: null };
    return {
        networkACLs,
    };
}
async function dump(context) {
    let { networkACLs } = context.assets;
    if (!networkACLs)
        return { networkACLs: null };
    if (Array.isArray(networkACLs) && networkACLs.length === 0) {
        logger_1.default.info('No network ACLs available, skipping dump');
        return { networkACLs: null };
    }
    const removeKeysFromOutput = ['created_at', 'updated_at'];
    networkACLs = networkACLs.map((networkACL) => {
        removeKeysFromOutput.forEach((key) => {
            if (key in networkACL) {
                delete networkACL[key];
            }
        });
        return networkACL;
    });
    return {
        networkACLs,
    };
}
const networkACLsHandler = {
    parse,
    dump,
};
exports.default = networkACLsHandler;
