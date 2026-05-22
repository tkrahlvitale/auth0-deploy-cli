"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const utils_1 = require("../../../utils");
const sessionDurationsToMinutes_1 = require("../../../sessionDurationsToMinutes");
function parse(context) {
    const baseFolder = path_1.default.join(context.filePath);
    if (!(0, utils_1.existsMustBeDir)(baseFolder))
        return { tenant: null }; // Skip
    const tenantFile = path_1.default.join(baseFolder, 'tenant.json');
    if (!(0, utils_1.isFile)(tenantFile)) {
        return { tenant: null };
    }
    /* eslint-disable camelcase */
    const { session_lifetime, idle_session_lifetime, idle_ephemeral_session_lifetime, ephemeral_session_lifetime, ...tenant } = (0, utils_1.loadJSON)(tenantFile, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    });
    (0, utils_1.clearTenantFlags)(tenant);
    const sessionDurations = (0, sessionDurationsToMinutes_1.sessionDurationsToMinutes)({
        session_lifetime,
        idle_session_lifetime,
        idle_ephemeral_session_lifetime,
        ephemeral_session_lifetime,
    });
    return {
        //@ts-ignore
        tenant: {
            ...tenant,
            ...sessionDurations,
        },
    };
}
async function dump(context) {
    const { tenant } = context.assets;
    if (!tenant)
        return; // Skip, nothing to dump
    (0, utils_1.clearTenantFlags)(tenant);
    const tenantFile = path_1.default.join(context.filePath, 'tenant.json');
    (0, utils_1.dumpJSON)(tenantFile, tenant);
}
const tenantHandler = {
    parse,
    dump,
};
exports.default = tenantHandler;
