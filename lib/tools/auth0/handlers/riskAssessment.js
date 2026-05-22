"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const default_1 = __importDefault(require("./default"));
const auth0_1 = require("auth0");
exports.schema = {
    type: 'object',
    properties: {
        settings: {
            type: 'object',
            properties: {
                enabled: {
                    type: 'boolean',
                    description: 'Whether or not risk assessment is enabled.',
                },
            },
            required: ['enabled'],
        },
        new_device: {
            type: 'object',
            properties: {
                remember_for: {
                    type: 'number',
                    description: 'Length of time to remember devices for, in days.',
                },
            },
            required: ['remember_for'],
        },
    },
    required: ['settings'],
};
class RiskAssessmentHandler extends default_1.default {
    constructor(config) {
        super({
            ...config,
            type: 'riskAssessment',
        });
    }
    async getType() {
        if (this.existing) {
            return this.existing;
        }
        try {
            const [settings, newDeviceSettings] = await Promise.all([
                this.client.riskAssessments.settings.get(),
                this.client.riskAssessments.settings.newDevice.get().catch((err) => {
                    if (err instanceof auth0_1.ManagementError && err?.statusCode === 404) {
                        return { remember_for: 0 };
                    }
                    throw err;
                }),
            ]);
            const riskAssessment = {
                settings: settings,
                new_device: newDeviceSettings,
                ...(newDeviceSettings.remember_for > 0 && {
                    new_device: newDeviceSettings,
                }),
            };
            this.existing = riskAssessment;
            return this.existing;
        }
        catch (err) {
            if (err instanceof auth0_1.ManagementError && err.statusCode === 404) {
                const riskAssessment = {
                    settings: { enabled: false },
                };
                this.existing = riskAssessment;
                return this.existing;
            }
            throw err;
        }
    }
    async processChanges(assets) {
        const { riskAssessment } = assets;
        // Non-existing section means it doesn't need to be processed
        if (!riskAssessment) {
            return;
        }
        const updates = [];
        // Update main settings (enabled flag)
        updates.push(this.client.riskAssessments.settings.update(riskAssessment?.settings));
        // Update new device settings if provided
        if (riskAssessment.new_device) {
            updates.push(this.client.riskAssessments.settings.newDevice.update(riskAssessment.new_device));
        }
        await Promise.all(updates);
        this.updated += 1;
        this.didUpdate(riskAssessment);
    }
}
exports.default = RiskAssessmentHandler;
