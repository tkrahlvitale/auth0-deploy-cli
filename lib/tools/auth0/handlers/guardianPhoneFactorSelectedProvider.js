"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const default_1 = __importDefault(require("./default"));
const constants_1 = __importDefault(require("../../constants"));
const utils_1 = require("../../utils");
exports.schema = {
    type: 'object',
    properties: {
        provider: {
            type: 'string',
            enum: constants_1.default.GUARDIAN_PHONE_PROVIDERS,
        },
    },
    additionalProperties: false,
};
const isFeatureUnavailableError = (err) => {
    if (err.statusCode === 404) {
        // Older Management API version where the endpoint is not available.
        return true;
    }
    if (err.statusCode === 403 &&
        err.originalError &&
        err.originalError.response &&
        err.originalError.response.body &&
        err.originalError.response.body.errorCode === 'hooks_not_allowed') {
        // Recent Management API version, but with feature explicitly disabled.
        return true;
    }
    return false;
};
class GuardianPhoneSelectedProviderHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'guardianPhoneFactorSelectedProvider',
        });
    }
    async getType() {
        if (this.existing)
            return this.existing;
        try {
            const data = await this.client.guardian.factors.phone.getSelectedProvider();
            this.existing = data;
        }
        catch (err) {
            if (isFeatureUnavailableError(err)) {
                // Gracefully skip processing this configuration value.
                return null;
            }
            if ((0, utils_1.isForbiddenFeatureError)(err, this.type)) {
                return null;
            }
            throw err;
        }
        return this.existing;
    }
    async processChanges(assets) {
        // No API to delete or create guardianPhoneFactorSelectedProvider, we can only update.
        const { guardianPhoneFactorSelectedProvider } = assets;
        // Do nothing if not set
        if (!guardianPhoneFactorSelectedProvider || !guardianPhoneFactorSelectedProvider.provider) {
            return;
        }
        if ((0, utils_1.isDryRun)(this.config)) {
            const { del, update, create } = await this.calcChanges(assets);
            if (create.length === 0 && update.length === 0 && del.length === 0) {
                return;
            }
        }
        const data = guardianPhoneFactorSelectedProvider;
        await this.client.guardian.factors.phone.setProvider(data);
        this.updated += 1;
        this.didUpdate(guardianPhoneFactorSelectedProvider);
    }
}
exports.default = GuardianPhoneSelectedProviderHandler;
