"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = deploy;
const auth0_1 = __importDefault(require("./auth0"));
const logger_1 = __importDefault(require("../logger"));
const utils_1 = require("../utils");
function zeroChangeSummary(auth0) {
    return auth0.handlers.reduce((accum, h) => {
        accum[h.type] = { deleted: 0, created: 0, updated: 0 };
        return accum;
    }, {});
}
async function deploy(assets, client, config) {
    // Setup log level
    const isDebug = process.env.AUTH0_DEBUG === 'true';
    logger_1.default.level = isDebug ? 'debug' : 'info';
    const dryRunMode = config('AUTH0_DRY_RUN');
    // Normalize boolean true (EA compat) → 'preview'
    const effectiveMode = dryRunMode === true || dryRunMode === 'true' ? 'preview' : dryRunMode;
    if (dryRunMode && effectiveMode !== 'preview') {
        throw new Error(`Invalid AUTH0_DRY_RUN value: ${dryRunMode}. Use true or 'preview'.`);
    }
    const isInteractive = !!config('AUTH0_DRY_RUN_INTERACTIVE');
    const shouldApplyAfterPreview = (0, utils_1.isTruthy)(config('AUTH0_DRY_RUN_APPLY'));
    logger_1.default.info(`Getting access token for ${config('AUTH0_CLIENT_ID') !== undefined ? `${config('AUTH0_CLIENT_ID')}/` : ''}${config('AUTH0_DOMAIN')}`);
    const auth0 = new auth0_1.default(client, assets, config);
    // Validate Assets
    await auth0.validate();
    if (effectiveMode === 'preview') {
        const hasChanges = await auth0.dryRun({
            interactive: isInteractive && !shouldApplyAfterPreview,
        });
        if (!shouldApplyAfterPreview || !hasChanges) {
            return zeroChangeSummary(auth0);
        }
    }
    // Process changes
    await auth0.processChanges();
    return auth0.handlers.reduce((accum, h) => {
        accum[h.type] = {
            deleted: h.deleted,
            created: h.created,
            updated: h.updated,
        };
        return accum;
    }, {});
}
