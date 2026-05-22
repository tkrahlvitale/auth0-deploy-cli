"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFlowConnections = exports.schema = void 0;
const lodash_1 = require("lodash");
const default_1 = __importStar(require("./default"));
const constants_1 = __importDefault(require("../../constants"));
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../utils");
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            app_id: { type: 'string', enum: constants_1.default.CONNECTION_APP_ID },
            environment: { type: 'string' },
            setup: { type: 'object' },
            account_name: { type: 'string' },
            ready: { type: 'boolean' },
        },
        required: ['name', 'app_id'],
    },
    additionalProperties: false,
};
const getAllFlowConnections = async (auth0Client) => {
    const allFlowConnections = [];
    let vaultConnections = await auth0Client.flows.vault.connections.list();
    // Process first page
    allFlowConnections.push(...vaultConnections.data);
    // Fetch remaining pages
    while (vaultConnections.hasNextPage()) {
        vaultConnections = await vaultConnections.getNextPage();
        allFlowConnections.push(...vaultConnections.data);
    }
    return allFlowConnections;
};
exports.getAllFlowConnections = getAllFlowConnections;
class FlowVaultHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'flowVaultConnections',
            id: 'id',
            stripCreateFields: ['created_at', 'updated_at', 'refreshed_at', 'fingerprint', 'ready'],
            stripUpdateFields: ['created_at', 'updated_at', 'refreshed_at', 'fingerprint', 'ready'],
        });
    }
    objString(item) {
        return super.objString({ id: item.id, name: item.name });
    }
    async getType() {
        if (this.existing) {
            return this.existing;
        }
        this.existing = await (0, exports.getAllFlowConnections)(this.client);
        return this.existing;
    }
    async processChanges(assets) {
        const { flowVaultConnections } = assets;
        // Do nothing if not set
        if (!flowVaultConnections)
            return;
        const { del, update, create } = await this.calcChanges(assets);
        if ((0, utils_1.isDryRun)(this.config)) {
            if (create.length === 0 && update.length === 0 && del.length === 0) {
                return;
            }
        }
        if (del.length > 0) {
            await this.deleteVaultConnections(del);
        }
        if (create.length > 0) {
            await this.createVaultConnections(create);
        }
        if (update.length > 0) {
            await this.updateVaultConnections(update);
        }
    }
    async createVaultConnection(conn) {
        if ('ready' in conn) {
            delete conn.ready;
        }
        if ('account_name' in conn) {
            delete conn.account_name;
        }
        const created = await this.client.flows.vault.connections.create(conn);
        return created;
    }
    async createVaultConnections(creates) {
        await this.client.pool
            .addEachTask({
            data: creates || [],
            generator: (item) => this.createVaultConnection(item)
                .then((data) => {
                this.didCreate(data);
                this.created += 1;
            })
                .catch((err) => {
                throw new Error(`Problem creating ${this.type} ${this.objString(item)}\n${err}`);
            }),
        })
            .promise();
    }
    async updateVaultConnection(conn) {
        const { id, name, setup } = conn;
        const params = {
            name,
        };
        if (!(0, lodash_1.isEmpty)(setup)) {
            params.setup = setup;
        }
        const updated = await this.client.flows.vault.connections.update(id, params);
        return updated;
    }
    async updateVaultConnections(updates) {
        await this.client.pool
            .addEachTask({
            data: updates || [],
            generator: (item) => this.updateVaultConnection(item)
                .then((data) => {
                this.didUpdate(data);
                this.updated += 1;
            })
                .catch((err) => {
                throw new Error(`Problem updating ${this.type} ${this.objString(item)}\n${err}`);
            }),
        })
            .promise();
    }
    async deleteVaultConnection(conn) {
        await this.client.flows.vault.connections.delete(conn.id);
    }
    async deleteVaultConnections(data) {
        if (this.config('AUTH0_ALLOW_DELETE') === 'true' ||
            this.config('AUTH0_ALLOW_DELETE') === true) {
            await this.client.pool
                .addEachTask({
                data: data || [],
                generator: (item) => this.deleteVaultConnection(item)
                    .then(() => {
                    this.didDelete(item);
                    this.deleted += 1;
                })
                    .catch((err) => {
                    throw new Error(`Problem deleting ${this.type} ${this.objString(item)}\n${err}`);
                }),
            })
                .promise();
        }
        else {
            logger_1.default.warn(`Detected the following flow vault connection should be deleted. Doing so may be destructive.\nYou can enable deletes by setting 'AUTH0_ALLOW_DELETE' to true in the config
      \n${data.map((i) => this.objString(i)).join('\n')}`);
        }
    }
}
exports.default = FlowVaultHandler;
__decorate([
    (0, default_1.order)('70')
], FlowVaultHandler.prototype, "processChanges", null);
