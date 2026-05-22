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
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const auth0_1 = require("auth0");
const default_1 = __importStar(require("./default"));
const utils_1 = require("../../utils");
const client_1 = require("../client");
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            client_id: { type: 'string' },
            audience: { type: 'string' },
            scope: {
                type: 'array',
                items: { type: 'string' },
                uniqueItems: true,
            },
            subject_type: {
                type: 'string',
                enum: Object.values(auth0_1.Management.ClientGrantSubjectTypeEnum),
                description: 'The subject type for this grant.',
            },
            authorization_details_types: {
                type: 'array',
                description: 'Types of authorization_details allowed for this client grant.',
                items: {
                    type: 'string',
                },
                uniqueItems: true,
            },
            allow_all_scopes: {
                type: 'boolean',
                description: 'When enabled, all scopes configured on the resource server are allowed for by this client grant.',
            },
            default_for: {
                type: 'string',
                enum: ['third_party_clients'],
                description: 'Indicates that a client grant is the default client grant for third party clients.',
            },
        },
        required: ['audience'],
    },
};
class ClientGrantsHandler extends default_1.default {
    constructor(config) {
        super({
            ...config,
            type: 'clientGrants',
            id: 'id',
            // Nested arrays are not reflected in the type but are supported at runtime.
            // Try ['client_id', 'audience', 'subject_type'] first, then ['client_id', 'audience']
            // for regular grants, then ['default_for', 'audience'] for default third-party grants
            // which have no client_id.
            identifiers: [
                'id',
                ['client_id', 'audience', 'subject_type'],
                ['client_id', 'audience'],
                ['default_for', 'audience'],
            ],
            stripUpdateFields: ['audience', 'client_id', 'subject_type', 'is_system', 'default_for'],
            ignoreDryRunFields: ['_clientName'],
        });
    }
    objString(item) {
        return super.objString({ id: item.id, client_id: item.client_id, audience: item.audience });
    }
    async validate(assets) {
        const { clientGrants } = assets;
        // Do nothing if not set
        if (!clientGrants)
            return;
        // Validate each client grant
        clientGrants.forEach((grant) => {
            // client_id and default_for are mutually exclusive; exactly one must be present
            const hasClientId = !!grant.client_id;
            const hasDefaultFor = !!grant.default_for;
            if (hasClientId && hasDefaultFor) {
                throw new Error(`Client grant for audience "${grant.audience}": Cannot specify both "client_id" and "default_for". They are mutually exclusive.`);
            }
            if (!hasClientId && !hasDefaultFor) {
                throw new Error(`Client grant for audience "${grant.audience}": One of "client_id" or "default_for" is required.`);
            }
            // When allow_all_scopes is true, scope should not be present
            if (grant.allow_all_scopes === true && grant.scope && grant.scope.length > 0) {
                throw new Error(`Client grant for client_id "${grant.client_id}" and audience "${grant.audience}": Cannot specify "scope" when "allow_all_scopes" is set to true. Remove the "scope" property or set "allow_all_scopes" to false.`);
            }
        });
        await super.validate(assets);
    }
    async getType() {
        if (this.existing) {
            return this.existing;
        }
        const clientGrants = await (0, client_1.paginate)(this.client.clientGrants.list, {
            checkpoint: true,
        });
        this.existing = clientGrants;
        // Always filter out the client we are using to access Auth0 Management API
        // As it could cause problems if the grants are deleted or updated etc
        const currentClient = this.config('AUTH0_CLIENT_ID');
        this.existing = this.existing.filter((grant) => grant.client_id !== currentClient);
        // Filter out third-party client grants when AUTH0_EXCLUDE_THIRD_PARTY_CLIENTS is enabled
        if ((0, utils_1.shouldExcludeThirdPartyClients)(this.config)) {
            const clients = await (0, client_1.paginate)(this.client.clients.list, {
                paginate: true,
                is_first_party: true,
            });
            const firstPartyClientIds = new Set(clients.map((c) => c.client_id));
            // default_for grants have no client_id and are not tied to a specific client; always keep them
            this.existing = this.existing.filter((grant) => !grant.client_id || firstPartyClientIds.has(grant.client_id));
        }
        return this.existing;
    }
    // Run after clients are updated so we can convert client_id names to id's
    async processChanges(assets) {
        const { clientGrants } = assets;
        // Do nothing if not set
        if (!clientGrants)
            return;
        const clients = await (0, client_1.paginate)(this.client.clients.list, {
            paginate: true,
        });
        const excludedClientsByNames = (assets.exclude && assets.exclude.clients) || [];
        const excludedClients = (0, utils_1.convertClientNamesToIds)(excludedClientsByNames, clients);
        // Convert clients by name to the id
        const formatted = clientGrants.map((clientGrant) => {
            const grant = { ...clientGrant };
            const found = clients.find((c) => c.name === grant.client_id);
            if (found)
                grant.client_id = found.client_id;
            return grant;
        });
        // Always filter out the client we are using to access Auth0 Management API
        const currentClient = this.config('AUTH0_CLIENT_ID');
        // Build a set of third-party client IDs for efficient lookup
        const thirdPartyClientIds = new Set(clients.filter((c) => c.is_first_party === false).map((c) => c.client_id));
        const { del, update, create, conflicts } = await this.calcChanges({
            ...assets,
            clientGrants: formatted,
        });
        // subject_type is immutable (in stripUpdateFields). Grants matched via the
        // ['client_id', 'audience'] fallback with a mismatched subject_type must become
        // DELETE + CREATE, not UPDATE, so the tenant converges to the desired state.
        const subjectTypeMismatches = update.filter((localGrant) => {
            // Only flag when local explicitly specifies subject_type (backward compat).
            if (localGrant.subject_type === undefined)
                return false;
            const remoteGrant = (this.existing || []).find((e) => e.id === localGrant.id);
            return (remoteGrant && (remoteGrant.subject_type ?? null) !== (localGrant.subject_type ?? null));
        });
        const adjustedUpdate = update.filter((u) => !subjectTypeMismatches.includes(u));
        const adjustedDel = [
            ...del,
            ...subjectTypeMismatches
                .map((u) => (this.existing || []).find((e) => e.id === u.id))
                .filter((e) => e !== undefined),
        ];
        const adjustedCreate = [
            ...create,
            ...subjectTypeMismatches
                .map((u) => formatted.find((f) => f.client_id === u.client_id &&
                f.audience === u.audience &&
                (f.subject_type ?? null) === (u.subject_type ?? null)))
                .filter((g) => g !== undefined),
        ];
        const filterGrants = (list) => {
            let filtered = list;
            // Filter out the current client (Auth0 Management API client)
            filtered = filtered.filter((item) => item.client_id !== currentClient);
            // Filter out excluded clients; default_for grants have no client_id and are never excluded
            if (excludedClients.length) {
                filtered = filtered.filter((item) => !item.client_id ||
                    ![...excludedClientsByNames, ...excludedClients].includes(item.client_id));
            }
            // Filter out system grants
            filtered = filtered.filter((item) => item.is_system !== true);
            // Filter out third-party client grants when flag is enabled
            if ((0, utils_1.shouldExcludeThirdPartyClients)(this.config)) {
                filtered = filtered.filter((item) => !thirdPartyClientIds.has(item.client_id));
            }
            return filtered;
        };
        const changes = {
            // @ts-ignore because this expects `client_id` and that's not yet typed on Asset
            del: filterGrants(adjustedDel),
            // @ts-ignore because this expects `client_id` and that's not yet typed on Asset
            update: filterGrants(adjustedUpdate),
            // @ts-ignore because this expects `client_id` and that's not yet typed on Asset
            create: filterGrants(adjustedCreate),
            // @ts-ignore because this expects `client_id` and that's not yet typed on Asset
            conflicts: filterGrants(conflicts),
        };
        await super.processChanges(assets, {
            ...changes,
        });
    }
}
exports.default = ClientGrantsHandler;
__decorate([
    (0, default_1.order)('60')
], ClientGrantsHandler.prototype, "processChanges", null);
