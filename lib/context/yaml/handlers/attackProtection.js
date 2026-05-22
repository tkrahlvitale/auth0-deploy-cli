"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaults_1 = require("../../defaults");
async function parse(context) {
    const { attackProtection } = context.assets;
    if (!attackProtection)
        return { attackProtection: null };
    return {
        attackProtection,
    };
}
async function dump(context) {
    const { attackProtection } = context.assets;
    if (!attackProtection)
        return { attackProtection: null };
    const { botDetection, suspiciousIpThrottling, breachedPasswordDetection, bruteForceProtection, captcha, } = attackProtection;
    const attackProtectionConfig = {
        suspiciousIpThrottling,
        breachedPasswordDetection,
        bruteForceProtection,
    };
    if (botDetection) {
        attackProtectionConfig.botDetection = botDetection;
    }
    if (captcha) {
        attackProtectionConfig.captcha = captcha;
    }
    const maskedAttackProtection = (0, defaults_1.attackProtectionDefaults)(attackProtectionConfig);
    return {
        attackProtection: maskedAttackProtection,
    };
}
const attackProtectionHandler = {
    parse: parse,
    dump: dump,
};
exports.default = attackProtectionHandler;
