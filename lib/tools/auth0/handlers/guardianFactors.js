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
            name: { type: 'string', enum: constants_1.default.GUARDIAN_FACTORS },
        },
        required: ['name'],
    },
};
class GuardianFactorsHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'guardianFactors',
            id: 'name',
        });
    }
    async getType() {
        if (this.existing)
            return this.existing;
        try {
            const factors = await this.client.guardian.factors.list();
            this.existing = (0, utils_1.sortGuardianFactors)(factors);
            return this.existing;
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
        // No API to delete or create guardianFactors, we can only update.
        const { guardianFactors } = assets;
        // Do nothing if not set
        if (!guardianFactors || !guardianFactors.length)
            return;
        if ((0, utils_1.isDryRun)(this.config)) {
            const { del, update, create } = await this.calcChanges(assets);
            if (create.length === 0 && update.length === 0 && del.length === 0) {
                return;
            }
        }
        // Process each factor
        await Promise.all(guardianFactors.map(async (factor) => {
            const data = { ...factor };
            const params = { name: factor.name };
            delete data.name;
            await this.client.guardian.factors.set(params.name, data);
            this.didUpdate(params);
            this.updated += 1;
        }));
    }
}
exports.default = GuardianFactorsHandler;
