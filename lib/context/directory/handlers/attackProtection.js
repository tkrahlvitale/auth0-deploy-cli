"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const utils_1 = require("../../../utils");
const defaults_1 = require("../../defaults");
function attackProtectionFiles(filePath) {
    const directory = path_1.default.join(filePath, tools_1.constants.ATTACK_PROTECTION_DIRECTORY);
    return {
        directory: directory,
        botDetection: path_1.default.join(directory, 'bot-detection.json'),
        breachedPasswordDetection: path_1.default.join(directory, 'breached-password-detection.json'),
        bruteForceProtection: path_1.default.join(directory, 'brute-force-protection.json'),
        captcha: path_1.default.join(directory, 'captcha.json'),
        suspiciousIpThrottling: path_1.default.join(directory, 'suspicious-ip-throttling.json'),
    };
}
function parse(context) {
    const files = attackProtectionFiles(context.filePath);
    if (!(0, utils_1.existsMustBeDir)(files.directory)) {
        return {
            attackProtection: null,
        };
    }
    const breachedPasswordDetection = (0, utils_1.loadJSON)(files.breachedPasswordDetection, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    });
    const bruteForceProtection = (0, utils_1.loadJSON)(files.bruteForceProtection, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    });
    const suspiciousIpThrottling = (0, utils_1.loadJSON)(files.suspiciousIpThrottling, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    });
    const attackProtection = {
        breachedPasswordDetection,
        bruteForceProtection,
        suspiciousIpThrottling,
    };
    if ((0, utils_1.isFile)(files.botDetection)) {
        attackProtection.botDetection = (0, utils_1.loadJSON)(files.botDetection, {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        });
    }
    if ((0, utils_1.isFile)(files.captcha)) {
        attackProtection.captcha = (0, utils_1.loadJSON)(files.captcha, {
            mappings: context.mappings,
            disableKeywordReplacement: context.disableKeywordReplacement,
        });
    }
    return {
        attackProtection,
    };
}
async function dump(context) {
    const { attackProtection } = context.assets;
    if (!attackProtection)
        return;
    const files = attackProtectionFiles(context.filePath);
    fs_extra_1.default.ensureDirSync(files.directory);
    const maskedAttackProtection = (0, defaults_1.attackProtectionDefaults)(attackProtection);
    if (maskedAttackProtection.botDetection) {
        (0, utils_1.dumpJSON)(files.botDetection, maskedAttackProtection.botDetection);
    }
    if (maskedAttackProtection.breachedPasswordDetection) {
        (0, utils_1.dumpJSON)(files.breachedPasswordDetection, maskedAttackProtection.breachedPasswordDetection);
    }
    if (maskedAttackProtection.bruteForceProtection) {
        (0, utils_1.dumpJSON)(files.bruteForceProtection, maskedAttackProtection.bruteForceProtection);
    }
    if (maskedAttackProtection.captcha) {
        (0, utils_1.dumpJSON)(files.captcha, maskedAttackProtection.captcha);
    }
    if (maskedAttackProtection.suspiciousIpThrottling) {
        (0, utils_1.dumpJSON)(files.suspiciousIpThrottling, maskedAttackProtection.suspiciousIpThrottling);
    }
}
const attackProtectionHandler = {
    parse,
    dump,
};
exports.default = attackProtectionHandler;
