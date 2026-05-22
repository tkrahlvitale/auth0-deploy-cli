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
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: { type: 'string', enum: constants_1.default.GUARDIAN_FACTOR_TEMPLATES },
        },
        required: ['name'],
    },
};
class GuardianFactorTemplatesHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'guardianFactorTemplates',
            id: 'name',
        });
    }
    async getType() {
        if (this.existing)
            return this.existing;
        try {
            const data = await Promise.all(constants_1.default.GUARDIAN_FACTOR_TEMPLATES.map(async (name) => {
                if (name === 'sms') {
                    const templates = await this.client.guardian.factors.sms.getTemplates();
                    return { name, ...templates };
                }
                const templates = await this.client.guardian.factors.phone.getTemplates();
                return { name, ...templates };
            }));
            // Filter out empty, should have more then 1 keys (name)
            return data.filter((d) => Object.keys(d).length > 1);
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
        // No API to delete or create guardianFactorTemplates, we can only update.
        const { guardianFactorTemplates } = assets;
        // Do nothing if not set
        if (!guardianFactorTemplates || !guardianFactorTemplates.length)
            return;
        // Process each factor templates
        await Promise.all(guardianFactorTemplates.map(async (fatorTemplates) => {
            const { name, ...data } = fatorTemplates;
            const params = { name: fatorTemplates.name };
            if (name === 'sms') {
                await this.client.guardian.factors.sms.setTemplates(data);
            }
            else if (name === 'phone') {
                await this.client.guardian.factors.phone.setTemplates(data);
            }
            this.didUpdate(params);
            this.updated += 1;
        }));
    }
}
exports.default = GuardianFactorTemplatesHandler;
