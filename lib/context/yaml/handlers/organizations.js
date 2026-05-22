"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parse(context) {
    const { organizations } = context.assets;
    if (!organizations)
        return { organizations: null };
    return {
        organizations,
    };
}
async function dump(context) {
    const { organizations } = context.assets;
    if (!organizations)
        return { organizations: null };
    return {
        organizations: organizations.map((org) => {
            if (org.connections.length > 0) {
                org.connections = org.connections.map((c) => {
                    // connection is a computed field
                    const name = c.connection && c.connection.name;
                    delete c.connection_id;
                    delete c.connection;
                    return {
                        name,
                        ...c,
                    };
                });
            }
            if (org.discovery_domains && org.discovery_domains.length > 0) {
                org.discovery_domains = org.discovery_domains.map((dd) => {
                    // discovery_domains id is a computed field
                    delete dd.id;
                    return {
                        ...dd,
                    };
                });
            }
            return org;
        }),
    };
}
const organizationsHandler = {
    parse,
    dump,
};
exports.default = organizationsHandler;
