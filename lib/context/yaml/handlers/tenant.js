"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const sessionDurationsToMinutes_1 = require("../../../sessionDurationsToMinutes");
async function parse(context) {
    if (!context.assets.tenant)
        return { tenant: null };
    /* eslint-disable camelcase */
    const { session_lifetime, idle_session_lifetime, idle_ephemeral_session_lifetime, ephemeral_session_lifetime, ...tenant } = context.assets.tenant;
    (0, utils_1.clearTenantFlags)(tenant);
    const sessionDurations = (0, sessionDurationsToMinutes_1.sessionDurationsToMinutes)({
        session_lifetime,
        idle_session_lifetime,
        idle_ephemeral_session_lifetime,
        ephemeral_session_lifetime,
    });
    return {
        tenant: {
            ...tenant,
            ...sessionDurations,
        },
    };
}
async function dump(context) {
    const { tenant } = context.assets;
    if (!tenant)
        return { tenant: null };
    (0, utils_1.clearTenantFlags)(tenant);
    return { tenant };
}
const tenantHandler = {
    parse,
    dump,
};
exports.default = tenantHandler;
