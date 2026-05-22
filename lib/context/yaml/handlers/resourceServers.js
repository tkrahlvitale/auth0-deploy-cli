"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../../tools/auth0/client");
const utils_1 = require("../../../utils");
async function parse(context) {
    const { resourceServers } = context.assets;
    let { clients } = context.assets;
    if (!resourceServers) {
        return { resourceServers: null };
    }
    if (clients === undefined) {
        clients = await (0, client_1.paginate)(context.mgmtClient.clients.list, {
            paginate: true,
            include_totals: true,
        });
    }
    return {
        resourceServers: resourceServers.map((rs) => {
            const dumpResourceServer = { ...rs };
            if (dumpResourceServer.client_id) {
                dumpResourceServer.client_id = (0, utils_1.convertClientIdToName)(dumpResourceServer.client_id, clients || []);
            }
            return dumpResourceServer;
        }),
    };
}
async function dump(context) {
    let { resourceServers } = context.assets;
    let { clients } = context.assets;
    if (!resourceServers) {
        return { resourceServers: null };
    }
    // Filter excluded resource servers
    const excludedResourceServers = (context.assets.exclude && context.assets.exclude.resourceServers) || [];
    if (excludedResourceServers.length) {
        resourceServers = resourceServers.filter((rs) => !excludedResourceServers.includes(rs.name ?? ''));
    }
    if (clients === undefined) {
        clients = await (0, client_1.paginate)(context.mgmtClient.clients.list, {
            paginate: true,
            include_totals: true,
        });
    }
    return {
        resourceServers: resourceServers.map((rs) => {
            const dumpResourceServer = { ...rs };
            if (dumpResourceServer.client_id) {
                dumpResourceServer.client_id = (0, utils_1.convertClientIdToName)(dumpResourceServer.client_id, clients || []);
            }
            return dumpResourceServer;
        }),
    };
}
const resourceServersHandler = {
    parse,
    dump,
};
exports.default = resourceServersHandler;
