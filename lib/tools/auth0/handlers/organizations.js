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
exports.schema = void 0;
const lodash_1 = require("lodash");
const auth0_1 = require("auth0");
const default_1 = __importStar(require("./default"));
const calculateChanges_1 = require("../../calculateChanges");
const logger_1 = __importDefault(require("../../../logger"));
const client_1 = require("../client");
const utils_1 = require("../../../utils");
const utils_2 = require("../../utils");
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            display_name: { type: 'string' },
            branding: { type: 'object' },
            metadata: { type: 'object' },
            connections: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        connection_id: { type: 'string' },
                        organization_connection_name: { type: 'string' },
                        assign_membership_on_login: { type: 'boolean' },
                        show_as_button: { type: 'boolean' },
                        is_signup_enabled: { type: 'boolean' },
                        organization_access_level: {
                            type: 'string',
                            enum: Object.values(auth0_1.Management.OrganizationAccessLevelEnum),
                        },
                        is_enabled: { type: 'boolean' },
                    },
                },
            },
            client_grants: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        client_id: { type: 'string' },
                    },
                },
                default: [],
            },
            token_quota: {
                type: ['object', 'null'],
                properties: {
                    client_credentials: {
                        type: 'object',
                        properties: {
                            enforce: {
                                type: 'boolean',
                                default: true,
                            },
                            per_day: {
                                type: 'integer',
                                minimum: 1,
                            },
                            per_hour: {
                                type: 'integer',
                                minimum: 1,
                            },
                        },
                        additionalProperties: false,
                        minProperties: 1,
                    },
                },
                required: ['client_credentials'],
            },
            discovery_domains: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        domain: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'verified'] },
                        use_for_organization_discovery: {
                            type: 'boolean',
                        },
                    },
                    required: ['domain', 'status'],
                },
            },
        },
        required: ['name'],
    },
};
class OrganizationsHandler extends default_1.default {
    constructor(config) {
        super({
            ...config,
            type: 'organizations',
            id: 'id',
        });
    }
    async deleteOrganization(org) {
        await this.client.organizations.delete(org.id);
    }
    async deleteOrganizations(data) {
        if (this.config('AUTH0_ALLOW_DELETE') === 'true' ||
            this.config('AUTH0_ALLOW_DELETE') === true) {
            await this.client.pool
                .addEachTask({
                data: data || [],
                generator: (item) => this.deleteOrganization(item)
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
            logger_1.default.warn(`Detected the following organizations should be deleted. Doing so may be destructive.\nYou can enable deletes by setting 'AUTH0_ALLOW_DELETE' to true in the config
      \n${data.map((i) => this.objString(i)).join('\n')}`);
        }
    }
    async createOrganization(org) {
        const organization = { ...org };
        delete organization.connections;
        delete organization.client_grants;
        if ('discovery_domains' in organization) {
            delete organization.discovery_domains;
        }
        const created = await this.client.organizations.create(organization);
        if (!created.id) {
            throw new Error(`Organization "${organization.name}" was created but the response did not include an ID. Skipping connection/grant association.`);
        }
        const createdId = created.id;
        if (typeof org.connections !== 'undefined' && org.connections.length > 0) {
            await Promise.all(org.connections.map((conn) => this.client.organizations.connections.create(createdId, conn)));
        }
        if (typeof org.client_grants !== 'undefined' && org.client_grants.length > 0) {
            await Promise.all(org.client_grants.map((organizationClientGrants) => this.createOrganizationClientGrants(createdId, this.getClientGrantIDByClientName(organizationClientGrants.client_id))));
        }
        if (typeof org.discovery_domains !== 'undefined' && org.discovery_domains.length > 0) {
            await Promise.all(org.discovery_domains.map((discoveryDomain) => this.createOrganizationDiscoveryDomain(createdId, {
                domain: discoveryDomain?.domain,
                status: discoveryDomain?.status,
                use_for_organization_discovery: discoveryDomain?.use_for_organization_discovery,
            }).catch((err) => {
                throw new Error(`Problem creating discovery domain ${discoveryDomain?.domain} for organization ${createdId}\n${err}`);
            })));
        }
        return created;
    }
    async createOrganizations(creates) {
        await this.client.pool
            .addEachTask({
            data: creates || [],
            generator: (item) => this.createOrganization(item)
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
    async updateOrganization(org, organizations) {
        const { connections: existingConnections, client_grants: existingClientGrants, discovery_domains: existingDiscoveryDomains, } = await organizations.find((orgToUpdate) => orgToUpdate.name === org.name);
        const params = { id: org.id };
        const { connections, client_grants: organizationClientGrants, discovery_domains: organizationDiscoveryDomains, } = org;
        delete org.connections;
        delete org.name;
        delete org.id;
        delete org.client_grants;
        delete org.discovery_domains;
        await this.client.organizations.update(params.id, org);
        // organization connections
        const connectionsToRemove = existingConnections.filter((c) => !connections.find((x) => x.connection_id === c.connection_id));
        const connectionsToAdd = connections.filter((c) => !existingConnections.find((x) => x.connection_id === c.connection_id));
        const connectionsToUpdate = connections.filter((c) => existingConnections.find((x) => x.connection_id === c.connection_id &&
            (x.assign_membership_on_login !== c.assign_membership_on_login ||
                x.show_as_button !== c.show_as_button ||
                x.is_signup_enabled !== c.is_signup_enabled ||
                x.organization_access_level !== c.organization_access_level ||
                x.organization_connection_name !== c.organization_connection_name ||
                x.is_enabled !== (c.is_enabled ?? true))));
        // Handle updates first
        await Promise.all(connectionsToUpdate.map((conn) => this.client.organizations.connections
            .update(params.id, conn.connection_id, {
            organization_connection_name: conn.organization_connection_name,
            assign_membership_on_login: conn.assign_membership_on_login,
            show_as_button: conn.show_as_button,
            is_signup_enabled: conn.is_signup_enabled,
            is_enabled: conn.is_enabled,
            organization_access_level: conn.organization_access_level,
        })
            .catch(() => {
            throw new Error(`Problem updating Enabled Connection ${conn.connection_id} for organizations ${params.id}`);
        })));
        await Promise.all(connectionsToAdd.map((conn) => this.client.organizations.connections
            .create(params.id, (0, lodash_1.omit)(conn, 'connection'))
            .catch(() => {
            throw new Error(`Problem adding Enabled Connection ${conn.connection_id} for organizations ${params.id}`);
        })));
        await Promise.all(connectionsToRemove.map((conn) => this.client.organizations.connections
            .delete(params.id, conn.connection_id)
            .catch(() => {
            throw new Error(`Problem removing Enabled Connection ${conn.connection_id} for organizations ${params.id}`);
        })));
        // organization client_grants
        const orgClientGrantsToRemove = existingClientGrants
            ?.filter((c) => !organizationClientGrants?.find((x) => x.client_id === c.client_id))
            ?.map((clientGrant) => ({
            grant_id: this.getClientGrantIDByClientName(clientGrant.client_id),
        })) || [];
        const orgClientGrantsToAdd = organizationClientGrants
            ?.filter((c) => !existingClientGrants?.find((x) => x.client_id === c.client_id))
            ?.map((clientGrant) => ({
            grant_id: this.getClientGrantIDByClientName(clientGrant.client_id),
        })) || [];
        // Handle updates first
        await Promise.all(orgClientGrantsToAdd.map((orgClientGrant) => this.createOrganizationClientGrants(params.id, orgClientGrant.grant_id).catch(() => {
            throw new Error(`Problem adding organization clientGrant ${orgClientGrant.grant_id} for organizations ${params.id}`);
        })));
        await Promise.all(orgClientGrantsToRemove.map((orgClientGrant) => this.deleteOrganizationClientGrants(params.id, orgClientGrant.grant_id).catch(() => {
            throw new Error(`Problem removing organization clientGrant ${orgClientGrant.grant_id} for organizations ${params.id}`);
        })));
        // organization discovery_domains
        const orgDiscoveryDomainsToRemove = existingDiscoveryDomains?.filter((existingDomain) => !organizationDiscoveryDomains?.find((d) => d.domain === existingDomain.domain)) || [];
        const orgDiscoveryDomainsToAdd = organizationDiscoveryDomains?.filter((domain) => !existingDiscoveryDomains?.find((d) => d.domain === domain.domain)) || [];
        const orgDiscoveryDomainsToUpdate = existingDiscoveryDomains
            ?.map((existingDomain) => {
            const updatedDomain = organizationDiscoveryDomains?.find((d) => d.domain === existingDomain.domain);
            if (!updatedDomain)
                return undefined;
            return {
                ...updatedDomain,
                id: existingDomain.id, // setting remote id for update
            };
        })
            .filter(Boolean) || [];
        for (const { id, domain, ...updateParams } of orgDiscoveryDomainsToUpdate) {
            try {
                await this.updateOrganizationDiscoveryDomain(params.id, id, domain, updateParams);
            }
            catch (err) {
                throw new Error(`Problem updating discovery domain ${domain} for organization ${params.id}\n${err.message}`);
            }
        }
        for (const domain of orgDiscoveryDomainsToAdd) {
            try {
                await this.createOrganizationDiscoveryDomain(params.id, {
                    domain: domain.domain,
                    status: domain.status,
                    use_for_organization_discovery: domain.use_for_organization_discovery,
                });
            }
            catch (err) {
                throw new Error(`Problem adding discovery domain ${domain.domain} for organization ${params.id}\n${err.message}`);
            }
        }
        if (orgDiscoveryDomainsToRemove.length > 0) {
            if (this.config('AUTH0_ALLOW_DELETE') === 'true' ||
                this.config('AUTH0_ALLOW_DELETE') === true) {
                for (const domain of orgDiscoveryDomainsToRemove) {
                    try {
                        await this.deleteOrganizationDiscoveryDomain(params.id, domain.domain, domain.id);
                    }
                    catch (err) {
                        throw new Error(`Problem removing discovery domain ${domain.domain} for organization ${params.id}\n${err.message}`);
                    }
                }
            }
            else {
                logger_1.default.warn(`Detected the following organization discovery domains should be deleted. Doing so may be destructive.\nYou can enable deletes by setting 'AUTH0_ALLOW_DELETE' to true in the config
      \n${orgDiscoveryDomainsToRemove.map((i) => this.objString(i)).join('\n')}`);
            }
        }
        return params;
    }
    getClientGrantIDByClientName(clientsName) {
        const found = this.formattedClientGrants.find((c) => c.client_id === clientsName);
        return found?.grant_id || '';
    }
    async getFormattedClientGrants() {
        const [clients, clientGrants] = await Promise.all([
            (0, client_1.paginate)(this.client.clients.list, {
                paginate: true,
            }),
            (0, client_1.paginate)(this.client.clientGrants.list, {
                paginate: true,
            }),
        ]);
        // Convert clients by name to the id and store it in the formattedClientGrants
        const formattedClientGrantsMapping = clientGrants?.map((clientGrant) => {
            const { id, client_id: clientName } = clientGrant;
            const grant = { grant_id: id, client_id: clientName };
            const found = clients.find((c) => c.client_id === grant.client_id);
            if (found)
                grant.client_id = found.name;
            return grant;
        });
        return formattedClientGrantsMapping;
    }
    async updateOrganizations(updates, orgs) {
        await this.client.pool
            .addEachTask({
            data: updates || [],
            generator: (item) => this.updateOrganization(item, orgs)
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
    async getType() {
        if (this.existing) {
            return this.existing;
        }
        try {
            const [organizations, clients] = await Promise.all([
                (0, client_1.paginate)(this.client.organizations.list, {
                    checkpoint: true,
                }),
                (0, client_1.paginate)(this.client.clients.list, {
                    paginate: true,
                }),
            ]);
            for (let index = 0; index < organizations.length; index++) {
                const org = organizations[index];
                if (!org?.id) {
                    throw new Error(`Organization ${index} is missing an ID`);
                }
                const connections = await this.getOrganizationConnections(org.id);
                org.connections = connections;
                const organizationClientGrants = await this.getOrganizationClientGrants(org.id);
                org.client_grants = organizationClientGrants?.map((clientGrant) => ({
                    client_id: (0, utils_1.convertClientIdToName)(clientGrant.client_id, clients),
                }));
                // Get discovery domains for each organization
                const organizationDiscoveryDomains = await this.getAllOrganizationDiscoveryDomains(org.id);
                if (organizationDiscoveryDomains) {
                    org.discovery_domains = organizationDiscoveryDomains;
                }
            }
            this.existing = organizations;
            return this.existing;
        }
        catch (err) {
            if (err.statusCode === 404 || err.statusCode === 501) {
                return [];
            }
            throw err;
        }
    }
    // Run after connections
    async processChanges(assets) {
        const { organizations } = assets;
        // Do nothing if not set
        if (!organizations)
            return;
        if ((0, utils_2.isDryRun)(this.config)) {
            const { del, update, create } = await this.calcChanges(assets);
            if (create.length === 0 && update.length === 0 && del.length === 0) {
                return;
            }
        }
        // Gets organizations from destination tenant
        const existing = await this.getType();
        const existingConnections = await (0, client_1.paginate)(this.client.connections.list, {
            checkpoint: true,
        });
        // We need to get the connection ids for the names configured so we can link them together
        organizations.forEach((org) => {
            org.connections = (org.connections || [])
                .map((connection) => {
                const { name } = connection;
                delete connection.name;
                return {
                    ...connection,
                    connection_id: (existingConnections.find((c) => c.name === name) || {}).id,
                };
            })
                .filter((connection) => !!connection.connection_id);
        });
        // store formated client_grants->client_id to client grant->grant_id mapping
        this.formattedClientGrants = await this.getFormattedClientGrants();
        const changes = (0, calculateChanges_1.calculateChanges)({
            handler: this,
            assets: organizations,
            existing,
            identifiers: this.identifiers,
            allowDelete: !!this.config('AUTH0_ALLOW_DELETE'),
        });
        logger_1.default.debug(`Start processChanges for organizations [delete:${changes.del.length}] [update:${changes.update.length}], [create:${changes.create.length}]`);
        if (changes.del.length > 0) {
            await this.deleteOrganizations(changes.del);
        }
        if (changes.create.length > 0) {
            await this.createOrganizations(changes.create);
        }
        if (changes.update.length > 0) {
            await this.updateOrganizations(changes.update, existing);
        }
    }
    async getOrganizationConnections(organizationId) {
        const allOrganizationConnections = [];
        let organizationConnections = await this.client.organizations.connections.list(organizationId);
        // Process first page
        allOrganizationConnections.push(...organizationConnections.data);
        // Fetch remaining pages
        while (organizationConnections.hasNextPage()) {
            organizationConnections = await organizationConnections.getNextPage();
            allOrganizationConnections.push(...organizationConnections.data);
        }
        return allOrganizationConnections;
    }
    async getOrganizationClientGrants(organizationId) {
        const allOrganizationClientGrants = [];
        let organizationClientGrants = await this.client.organizations.clientGrants.list(organizationId);
        // Process first page
        allOrganizationClientGrants.push(...organizationClientGrants.data);
        // Fetch remaining pages
        while (organizationClientGrants.hasNextPage()) {
            organizationClientGrants = await organizationClientGrants.getNextPage();
            allOrganizationClientGrants.push(...organizationClientGrants.data);
        }
        return allOrganizationClientGrants;
    }
    async createOrganizationClientGrants(organizationId, grantId) {
        logger_1.default.debug(`Creating organization client grant ${grantId} for organization ${organizationId}`);
        const organizationClientGrants = await this.client.organizations.clientGrants.create(organizationId, {
            grant_id: grantId,
        });
        return organizationClientGrants;
    }
    async deleteOrganizationClientGrants(organizationId, grantId) {
        logger_1.default.debug(`Deleting organization client grant ${grantId} for organization ${organizationId}`);
        await this.client.organizations.clientGrants.delete(organizationId, grantId);
    }
    async getAllOrganizationDiscoveryDomains(organizationId) {
        // paginate using checkpoint pagination for getAllDiscoveryDomains
        const allDiscoveryDomains = [];
        try {
            let orgDiscoveryDomain = await this.client.organizations.discoveryDomains.list(organizationId);
            // Process first page
            allDiscoveryDomains.push(...orgDiscoveryDomain.data);
            // Fetch remaining pages
            while (orgDiscoveryDomain.hasNextPage()) {
                orgDiscoveryDomain = await orgDiscoveryDomain.getNextPage();
                allDiscoveryDomains.push(...orgDiscoveryDomain.data);
            }
            return allDiscoveryDomains;
        }
        catch (err) {
            if (err.statusCode === 404 || err.statusCode === 501) {
                return null;
            }
            if (err.statusCode === 403 || err.errorCode === 'feature_not_enabled') {
                logger_1.default.debug('Organization Discovery domains are not enabled for this tenant. Please verify `scope` or contact Auth0 support to enable this feature.');
                return null;
            }
            throw err;
        }
    }
    async getOrganizationDiscoveryDomain(organizationId, discoveryDomainId) {
        const orgDiscoveryDomain = await this.client.organizations.discoveryDomains.get(organizationId, discoveryDomainId);
        return orgDiscoveryDomain;
    }
    async createOrganizationDiscoveryDomain(organizationId, discoveryDomain) {
        logger_1.default.debug(`Creating discovery domain ${discoveryDomain.domain} for organization ${organizationId}`);
        const orgDiscoveryDomain = await this.client.organizations.discoveryDomains.create(organizationId, discoveryDomain);
        return orgDiscoveryDomain;
    }
    async updateOrganizationDiscoveryDomain(organizationId, discoveryDomainId, discoveryDomain, discoveryDomainUpdate) {
        logger_1.default.debug(`Updating discovery domain ${discoveryDomain} for organization ${organizationId}`);
        // stripUpdateFields does not support in sub modules
        const stripUpdateFields = ['verification_host', 'verification_txt'];
        logger_1.default.debug(`Stripping ${this.type} discovery domain read-only fields ${JSON.stringify(stripUpdateFields)}`);
        const discoveryDomainUpdated = await this.client.organizations.discoveryDomains.update(organizationId, discoveryDomainId, {
            status: discoveryDomainUpdate.status,
            use_for_organization_discovery: discoveryDomainUpdate.use_for_organization_discovery,
        });
        return discoveryDomainUpdated;
    }
    async deleteOrganizationDiscoveryDomain(organizationId, discoveryDomain, discoveryDomainId) {
        logger_1.default.debug(`Deleting discovery domain ${discoveryDomain} for organization ${organizationId}`);
        await this.client.organizations.discoveryDomains.delete(organizationId, discoveryDomainId);
    }
}
exports.default = OrganizationsHandler;
__decorate([
    (0, default_1.order)('70')
], OrganizationsHandler.prototype, "processChanges", null);
