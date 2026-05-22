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
const default_1 = __importStar(require("./default"));
const calculateChanges_1 = require("../../calculateChanges");
const logger_1 = __importDefault(require("../../../logger"));
const client_1 = require("../client");
const utils_1 = require("../../utils");
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            id: { type: 'string' },
            description: { type: 'string' },
            permissions: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        permission_name: { type: 'string' },
                        resource_server_identifier: { type: 'string' },
                    },
                },
            },
        },
        required: ['name'],
    },
};
class RolesHandler extends default_1.default {
    constructor(config) {
        super({
            ...config,
            type: 'roles',
            id: 'id',
        });
    }
    async createRole(data) {
        const role = { ...data };
        delete role.permissions;
        const created = await this.client.roles.create(role);
        if (created.id && typeof data.permissions !== 'undefined' && data.permissions.length > 0) {
            await this.client.roles.permissions.add(created.id, { permissions: data.permissions });
        }
        return created;
    }
    async createRoles(creates) {
        await this.client.pool
            .addEachTask({
            data: creates || [],
            generator: (item) => this.createRole(item)
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
    async deleteRole(data) {
        await this.client.roles.delete(data.id);
    }
    async deleteRoles(dels) {
        if (this.config('AUTH0_ALLOW_DELETE') === 'true' ||
            this.config('AUTH0_ALLOW_DELETE') === true) {
            await this.client.pool
                .addEachTask({
                data: dels || [],
                generator: (item) => this.deleteRole(item)
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
            logger_1.default.warn(`Detected the following roles should be deleted. Doing so may be destructive.\nYou can enable deletes by setting 'AUTH0_ALLOW_DELETE' to true in the config
      \n${dels.map((i) => this.objString(i)).join('\n')}`);
        }
    }
    async updateRole(data, roles) {
        const existingRole = await roles.find((roleDataForUpdate) => roleDataForUpdate.name === data.name);
        const params = { id: data.id };
        const newPermissions = data.permissions;
        delete data.permissions;
        delete data.id;
        await this.client.roles.update(params.id, data);
        if (typeof existingRole.permissions !== 'undefined' && existingRole.permissions.length > 0) {
            await this.client.roles.permissions.delete(params.id, {
                permissions: existingRole.permissions,
            });
        }
        if (typeof newPermissions !== 'undefined' && newPermissions.length > 0) {
            await this.client.roles.permissions.add(params.id, { permissions: newPermissions });
        }
        return params;
    }
    async updateRoles(updates, roles) {
        await this.client.pool
            .addEachTask({
            data: updates || [],
            generator: (item) => this.updateRole(item, roles)
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
            const roles = await (0, client_1.paginate)(this.client.roles.list, {
                paginate: true,
                include_totals: true,
            });
            for (let index = 0; index < roles.length; index++) {
                const allPermission = [];
                /*
                let page = 0;
                while (true) {
                  const {
                    data: { permissions, total },
                  } = await this.client.roles.permissions.list({
                    include_totals: true,
                    id: roles[index].id,
                    page: page,
                    per_page: 100,
                  });
        
                  allPermission.push(...permissions);
                  page += 1;
                  if (allPermission.length === total) {
                    break;
                  }
                  // if we get an unexpected response, break the loop to avoid infinite loop
                  if (!isArray(permissions) || typeof total !== 'number') {
                    break;
                  }
                }
                */
                const rolesId = roles[index].id;
                let permissions = await this.client.roles.permissions.list(rolesId, { per_page: 100 });
                // Process first page
                allPermission.push(...permissions.data);
                // Fetch remaining pages
                while (permissions.hasNextPage()) {
                    permissions = await permissions.getNextPage();
                    allPermission.push(...permissions.data);
                }
                const strippedPerms = await Promise.all(allPermission.map(async (permission) => {
                    delete permission.resource_server_name;
                    delete permission.description;
                    return permission;
                }));
                roles[index].permissions = strippedPerms;
            }
            this.existing = roles;
            return this.existing;
        }
        catch (err) {
            if (err.statusCode === 404 || err.statusCode === 501) {
                return [];
            }
            throw err;
        }
    }
    async processChanges(assets) {
        const { roles } = assets;
        // Do nothing if not set
        if (!roles)
            return;
        if ((0, utils_1.isDryRun)(this.config)) {
            const { del, update, create } = await this.calcChanges(assets);
            if (create.length === 0 && update.length === 0 && del.length === 0) {
                return;
            }
        }
        // Gets roles from destination tenant
        const existing = await this.getType();
        const changes = (0, calculateChanges_1.calculateChanges)({
            handler: this,
            assets: roles,
            existing,
            identifiers: this.identifiers,
            allowDelete: !!this.config('AUTH0_ALLOW_DELETE'),
        });
        logger_1.default.debug(`Start processChanges for roles [delete:${changes.del.length}] [update:${changes.update.length}], [create:${changes.create.length}]`);
        if (changes.del.length > 0) {
            await this.deleteRoles(changes.del);
        }
        if (changes.create.length > 0) {
            await this.createRoles(changes.create);
        }
        if (changes.update.length > 0) {
            await this.updateRoles(changes.update, existing);
        }
    }
}
exports.default = RolesHandler;
__decorate([
    (0, default_1.order)('60')
], RolesHandler.prototype, "processChanges", null);
