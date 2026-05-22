"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tools_1 = require("../../../tools");
const utils_1 = require("../../../utils");
const client_1 = require("../../../tools/auth0/client");
function parse(context) {
    const resourceServersFolder = path_1.default.join(context.filePath, tools_1.constants.RESOURCE_SERVERS_DIRECTORY);
    if (!(0, utils_1.existsMustBeDir)(resourceServersFolder))
        return { resourceServers: null }; // Skip
    const foundFiles = (0, utils_1.getFiles)(resourceServersFolder, ['.json']);
    const resourceServers = foundFiles
        .map((f) => (0, utils_1.loadJSON)(f, {
        mappings: context.mappings,
        disableKeywordReplacement: context.disableKeywordReplacement,
    }))
        .filter((p) => Object.keys(p).length > 0); // Filter out empty resourceServers
    return {
        resourceServers,
    };
}
async function dump(context) {
    let { resourceServers } = context.assets;
    let { clients } = context.assets;
    if (!resourceServers)
        return; // Skip, nothing to dump
    // Filter excluded resource servers
    const excludedResourceServers = (context.assets.exclude && context.assets.exclude.resourceServers) || [];
    if (excludedResourceServers.length) {
        resourceServers = resourceServers.filter((resourceServer) => !excludedResourceServers.includes(resourceServer.name ?? ''));
    }
    const resourceServersFolder = path_1.default.join(context.filePath, tools_1.constants.RESOURCE_SERVERS_DIRECTORY);
    fs_extra_1.default.ensureDirSync(resourceServersFolder);
    if (clients === undefined) {
        clients = await (0, client_1.paginate)(context.mgmtClient.clients.list, {
            paginate: true,
            include_totals: true,
        });
    }
    resourceServers.forEach((resourceServer) => {
        const resourceServerFile = path_1.default.join(resourceServersFolder, (0, utils_1.sanitize)(`${resourceServer.name}.json`));
        if (resourceServer.client_id) {
            resourceServer.client_id = (0, utils_1.convertClientIdToName)(resourceServer.client_id, clients || []);
        }
        (0, utils_1.dumpJSON)(resourceServerFile, resourceServer);
    });
}
const resourceServersHandler = {
    parse,
    dump,
};
exports.default = resourceServersHandler;
