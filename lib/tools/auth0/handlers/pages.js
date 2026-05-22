"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.pageNameMap = exports.supportedPages = void 0;
const default_1 = __importDefault(require("./default"));
const constants_1 = __importDefault(require("../../constants"));
const client_1 = require("../client");
const utils_1 = require("../../utils");
exports.supportedPages = constants_1.default.PAGE_NAMES.filter((p) => p.includes('.json')).map((p) => p.replace('.json', ''));
exports.pageNameMap = {
    guardian_multifactor: 'guardian_mfa_page',
    password_reset: 'change_password',
    error_page: 'error_page',
};
// With this schema, we can only validate property types but not valid properties on per type basis
exports.schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: { type: 'string', enum: exports.supportedPages },
            html: { type: 'string', default: '' },
            url: { type: 'string' },
            show_log_link: { type: 'boolean' },
            enabled: { type: 'boolean' },
        },
        required: ['name'],
    },
};
class PagesHandler extends default_1.default {
    constructor(options) {
        super({
            ...options,
            type: 'pages',
            identifiers: ['name'],
        });
    }
    objString(page) {
        return super.objString({ name: page.name, enabled: page.enabled });
    }
    async updateLoginPage(page) {
        const globalClient = await (0, client_1.paginate)(this.client.clients.list, {
            paginate: true,
            is_global: true,
        });
        if (!globalClient[0]) {
            throw new Error('Unable to find global client id when trying to update the login page');
        }
        if (!globalClient[0].client_id) {
            throw new Error('Unable to find global client id when trying to update the login page');
        }
        await this.client.clients.update(globalClient[0].client_id, {
            custom_login_page: page.html,
            custom_login_page_on: page.enabled,
        });
        this.updated += 1;
        this.didUpdate(page);
    }
    async updatePages(pages) {
        const toUpdate = pages.filter((p) => exports.supportedPages.includes(p.name));
        const update = toUpdate.reduce((accum, page) => {
            if (exports.supportedPages.includes(page.name)) {
                const pageName = exports.pageNameMap[page.name];
                if (!pageName) {
                    throw new Error(`Unable to map page ${page.name} into tenant level page setting`);
                }
                accum[pageName] = { ...page };
                delete accum[pageName].name;
            }
            return accum;
        }, {});
        if (Object.keys(update).length) {
            await this.client.tenants.settings.update(update);
        }
        toUpdate.forEach((page) => {
            this.updated += 1;
            this.didUpdate(page);
        });
    }
    async getType() {
        const pages = [];
        // Login page is handled via the global client
        const globalClient = await (0, client_1.paginate)(this.client.clients.list, {
            paginate: true,
            include_totals: true,
            is_global: true,
        });
        if (!globalClient[0]) {
            throw new Error('Unable to find global client id when trying to dump the login page');
        }
        if (globalClient[0].custom_login_page) {
            pages.push({
                name: 'login',
                enabled: !!globalClient[0].custom_login_page_on,
                html: globalClient[0].custom_login_page,
            });
        }
        const tenantSettings = await this.client.tenants.settings.get();
        Object.entries(exports.pageNameMap).forEach(([key, name]) => {
            const page = tenantSettings[name];
            if (tenantSettings[name]) {
                pages.push({
                    ...page,
                    name: key,
                });
            }
        });
        return pages;
    }
    async processChanges(assets) {
        const { pages } = assets;
        // Do nothing if not set
        if (!pages)
            return;
        if ((0, utils_1.isDryRun)(this.config)) {
            const { del, update, create } = await this.calcChanges(assets);
            if (create.length === 0 && update.length === 0 && del.length === 0) {
                return;
            }
        }
        // Login page is handled via the global client
        const loginPage = pages.find((p) => p.name === 'login');
        if (loginPage !== undefined) {
            await this.updateLoginPage(loginPage);
        }
        // Rest of pages are on tenant level settings
        await this.updatePages(pages.filter((p) => p.name !== 'login'));
    }
}
exports.default = PagesHandler;
