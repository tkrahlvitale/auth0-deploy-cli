"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parse(context) {
    const { roles } = context.assets;
    if (!roles)
        return { roles: null };
    return {
        roles,
    };
}
async function dump(context) {
    const { roles } = context.assets;
    if (!roles)
        return { roles: null };
    return {
        roles: roles.map((role) => {
            if (role.description === null) {
                delete role.description;
            }
            return role;
        }),
    };
}
const rolesHandler = {
    parse,
    dump,
};
exports.default = rolesHandler;
