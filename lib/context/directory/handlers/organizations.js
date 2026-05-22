"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const logger_1 = __importDefault(require("../../../logger"));
const utils_1 = require("../../../utils");
function parse(context) {
    const organizationsFolder = path_1.default.join(context.filePath, 'organizations');
    if (!(0, utils_1.existsMustBeDir)(organizationsFolder))
        return { organizations: null }; // Skip
    const files = (0, utils_1.getFiles)(organizationsFolder, ['.json']);
    const organizations = files.map((f) => {
        const org = {
            ...(0, utils_1.loadJSON)(f, {
                mappings: context.mappings,
                disableKeywordReplacement: context.disableKeywordReplacement,
            }),
        };
        return org;
    });
    return {
        organizations,
    };
}
async function dump(context) {
    const { organizations } = context.assets;
    // API returns an empty object if no grants are present
    if (!organizations || organizations.constructor === Object)
        return; // Skip, nothing to dump
    const organizationsFolder = path_1.default.join(context.filePath, 'organizations');
    fs_extra_1.default.ensureDirSync(organizationsFolder);
    organizations.forEach((organization) => {
        const organizationFile = path_1.default.join(organizationsFolder, (0, utils_1.sanitize)(`${organization.name}.json`));
        logger_1.default.info(`Writing ${organizationFile}`);
        if (organization.connections.length > 0) {
            organization.connections = organization.connections.map((c) => {
                // connection is a computed field
                const name = c.connection && c.connection.name;
                const conn = {
                    name,
                    ...c,
                };
                delete conn.connection_id;
                delete conn.connection;
                return conn;
            });
        }
        if (organization.discovery_domains && organization.discovery_domains.length > 0) {
            organization.discovery_domains = organization.discovery_domains.map((dd) => {
                // discovery_domains id is a computed field
                delete dd.id;
                return {
                    ...dd,
                };
            });
        }
        (0, utils_1.dumpJSON)(organizationFile, organization);
    });
}
const organizationsHandler = {
    parse,
    dump,
};
exports.default = organizationsHandler;
