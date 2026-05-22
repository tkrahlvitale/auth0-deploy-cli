"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const client_1 = require("../../../tools/auth0/client");
async function parse(context) {
    const { clientGrants } = context.assets;
    if (!clientGrants)
        return { clientGrants: null };
    return {
        clientGrants,
    };
}
async function dump(context) {
    let { clients } = context.assets;
    let { clientGrants } = context.assets;
    if (!clientGrants)
        return { clientGrants: null };
    if (clients === undefined) {
        clients = await (0, client_1.paginate)(context.mgmtClient.clients.list, {
            paginate: true,
            include_totals: true,
        });
    }
    // Filter out grants for excluded clients
    const excludedClientsByNames = (context.assets.exclude && context.assets.exclude.clients) || [];
    if (excludedClientsByNames.length) {
        const excludedClientIds = new Set((clients || [])
            .filter((c) => c.name !== undefined && excludedClientsByNames.includes(c.name))
            .map((c) => c.client_id));
        clientGrants = clientGrants.filter((grant) => !excludedClientIds.has(grant.client_id));
    }
    // Convert client_id to the client name for readability
    return {
        clientGrants: clientGrants.map((grant) => {
            const dumpGrant = { ...grant };
            dumpGrant.client_id = (0, utils_1.convertClientIdToName)(dumpGrant.client_id, clients || []);
            return dumpGrant;
        }),
    };
}
const clientGrantsHandler = {
    parse,
    dump,
};
exports.default = clientGrantsHandler;
