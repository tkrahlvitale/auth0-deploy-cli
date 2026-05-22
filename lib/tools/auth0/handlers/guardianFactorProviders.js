"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const default_1 = __importDefault(require("./default"));
const constants_1 = __importDefault(require("../../constants"));
const utils_1 = require("../../utils");
const mappings = Object.entries(constants_1.default.GUARDIAN_FACTOR_PROVIDERS).reduce((accum, [name, providers]) => {
    providers.forEach((p) => {
        accum.push({ name, provider: p });
    });
    return accum;
}, []);
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: { type: 'string', enum: constants_1.default.GUARDIAN_FACTORS },
            provider: { type: 'string', enum: mappings.map((p) => p.provider) },
        },
        required: ['name', 'provider'],
    },
};
class GuardianFactorProvidersHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'guardianFactorProviders',
            id: 'name',
        });
    }
    async getType() {
        if (this.existing)
            return this.existing;
        try {
            const data = await Promise.all(mappings.map(async (m) => {
                let provider;
                if (m.name === 'phone' && m.provider === 'twilio') {
                    provider = await this.client.guardian.factors.phone.getTwilioProvider();
                }
                else if (m.name === 'sms' && m.provider === 'twilio') {
                    provider = await this.client.guardian.factors.sms.getTwilioProvider();
                }
                else if (m.name === 'push-notification' && m.provider === 'apns') {
                    provider = await this.client.guardian.factors.pushNotification.getApnsProvider();
                }
                else if (m.name === 'push-notification' && m.provider === 'sns') {
                    provider = await this.client.guardian.factors.pushNotification.getSnsProvider();
                }
                return { ...m, ...provider.data };
            }));
            // Filter out empty, should have more then 2 keys (name, provider)
            return data.filter((d) => Object.keys(d).length > 2);
        }
        catch (err) {
            if (err.statusCode === 404 || err.statusCode === 501) {
                return null;
            }
            if ((0, utils_1.isForbiddenFeatureError)(err, this.type)) {
                return null;
            }
            throw err;
        }
    }
    async processChanges(assets) {
        // No API to delete or create guardianFactorProviders, we can only update.
        const { guardianFactorProviders } = assets;
        // Do nothing if not set
        if (!guardianFactorProviders || !guardianFactorProviders.length)
            return;
        // Process each factor
        await Promise.all(guardianFactorProviders.map(async (factorProvider) => {
            const { name, provider, ...data } = factorProvider;
            const params = { name: factorProvider.name, provider: factorProvider.provider };
            if (name === 'phone' && provider === 'twilio') {
                await this.client.guardian.factors.phone.setTwilioProvider(data);
            }
            else if (name === 'sms' && provider === 'twilio') {
                await this.client.guardian.factors.sms.setTwilioProvider(data);
            }
            else if (name === 'push-notification' && provider === 'apns') {
                await this.client.guardian.factors.pushNotification.setApnsProvider(data);
            }
            else if (name === 'push-notification' && provider === 'fcm') {
                await this.client.guardian.factors.pushNotification.setFcmProvider(data);
            }
            else if (name === 'push-notification' && provider === 'sns') {
                await this.client.guardian.factors.pushNotification.setSnsProvider(data);
            }
            this.didUpdate(params);
            this.updated += 1;
        }));
    }
}
exports.default = GuardianFactorProvidersHandler;
