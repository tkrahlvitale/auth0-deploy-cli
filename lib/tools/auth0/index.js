"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = __importDefault(require("ajv/lib/ajv"));
const lodash_1 = require("lodash");
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = require("@clack/prompts");
const promise_pool_executor_1 = require("promise-pool-executor");
const client_1 = __importDefault(require("./client"));
const schema_1 = __importDefault(require("./schema"));
const handlers_1 = __importDefault(require("./handlers"));
const calculateDryRunChanges_1 = require("../calculateDryRunChanges");
const utils_1 = require("../../utils");
const utils_2 = require("../utils");
/**
 * Sorts handlers by their @order decorator metadata for a given stage.
 * Handlers are sorted in ascending order (lower values execute first).
 * Default order is 50 for handlers without explicit @order metadata.
 * Uses stable sort: preserves insertion order when order values are equal.
 *
 * @param toSort - Array of API handlers to sort
 * @param stage - The stage name (load, validate, processChanges)
 * @returns Sorted array of handlers
 */
function sortByOrder(toSort, stage) {
    const defaultOrder = 50;
    const sorted = [...toSort];
    sorted.sort((a, b) => {
        // @ts-ignore because stage methods may have order property
        const aOrder = a[stage]?.order || defaultOrder;
        // @ts-ignore because stage methods may have order property
        const bOrder = b[stage]?.order || defaultOrder;
        return aOrder - bOrder;
    });
    return sorted;
}
function buildTableBorder(left, middle, right, widths) {
    return `${left}${widths.map((width) => '─'.repeat(width + 2)).join(middle)}${right}`;
}
function formatStatusCell(status, width) {
    let statusColor;
    const baseStatus = status.replace(' *', '');
    switch (baseStatus) {
        case 'CREATE':
            statusColor = chalk_1.default.green;
            break;
        case 'UPDATE':
            statusColor = chalk_1.default.yellow;
            break;
        case 'DELETE':
            statusColor = chalk_1.default.red;
            break;
        default:
            statusColor = chalk_1.default.white;
    }
    if (status.includes(' *')) {
        return `${statusColor(baseStatus.padEnd(width - 2))}${chalk_1.default.dim(' *')}`;
    }
    return statusColor(baseStatus.padEnd(width));
}
class Auth0 {
    constructor(client, assets, config) {
        this.client = (0, client_1.default)(client);
        this.config = config;
        this.assets = assets;
        this.handlers = Object.values(handlers_1.default)
            .map((handler) => {
            //@ts-ignore because class expects `type` property but gets directly injected into class constructors
            return new handler.default({ client: this.client, config: this.config });
        })
            .filter((handler) => {
            const excludedAssetTypes = config('AUTH0_EXCLUDED');
            if (excludedAssetTypes === undefined)
                return true;
            return !excludedAssetTypes.includes(handler.type);
        })
            .filter((handler) => {
            const onlyIncludedAssetTypes = config('AUTH0_INCLUDED_ONLY');
            if (onlyIncludedAssetTypes === undefined)
                return true;
            return onlyIncludedAssetTypes.includes(handler.type);
        });
    }
    async runStage(stage) {
        // Sort by priority
        for (const handler of sortByOrder(this.handlers, stage)) {
            // eslint-disable-line
            try {
                const stageFn = Object.getPrototypeOf(handler)[stage];
                if (typeof stageFn !== 'function') {
                    throw new Error(`Handler ${handler.type} does not have a ${stage} method or it is not a function (got ${typeof stageFn})`);
                }
                this.assets = {
                    ...this.assets,
                    ...((await stageFn.apply(handler, [this.assets])) || {}),
                };
            }
            catch (err) {
                err.type = handler.type;
                err.stage = stage;
                throw err;
            }
        }
    }
    async validate() {
        const ajv = new ajv_1.default({ useDefaults: true, nullable: true });
        const nonNullAssets = Object.keys(this.assets)
            .filter((k) => this.assets[k] != null)
            .reduce((a, k) => ({ ...a, [k]: this.assets[k] }), {});
        const valid = ajv.validate(schema_1.default, nonNullAssets);
        if (!valid) {
            throw new Error(`Schema validation failed loading ${JSON.stringify(ajv.errors, null, 4)}`);
        }
        await this.runStage('validate');
    }
    async loadAssetsFromAuth0() {
        // Populate assets from auth0 tenant
        await this.runStage('load');
    }
    async processChanges() {
        await this.runStage('processChanges');
    }
    async dryRun(opts = {}) {
        const isDebug = process.env.AUTH0_DEBUG === 'true';
        const s = (0, prompts_1.spinner)();
        if (isDebug) {
            prompts_1.log.info('Preparing dry run preview...\n');
        }
        else {
            s.start('Preparing dry run preview...');
        }
        // Collect changes from all handlers
        const allChanges = {};
        const savedAssets = this.assets;
        this.assets = await (0, calculateDryRunChanges_1.dryRunFormatAssets)((0, lodash_1.cloneDeep)(this.assets), this.client);
        const dryRunPool = new promise_pool_executor_1.PromisePoolExecutor({
            concurrencyLimit: 2,
            frequencyLimit: 8,
            frequencyWindow: 1000, // 1 sec
        });
        await dryRunPool
            .addEachTask({
            data: this.handlers,
            generator: (handler) => (async () => {
                try {
                    const detailedChanges = [];
                    let created = 0;
                    let updated = 0;
                    let deleted = 0;
                    if (isDebug) {
                        prompts_1.log.info(`Calculating dry run changes for ${handler.type}...`);
                    }
                    else {
                        s.message(`Calculating dry run changes for ${handler.type}...`);
                    }
                    const changes = await handler.dryRunChanges(this.assets);
                    if (changes.create) {
                        changes.create.forEach((item) => {
                            detailedChanges.push({
                                action: 'CREATE',
                                identifier: handler.getResourceName(item),
                                details: item,
                            });
                        });
                        created = changes.create.length;
                    }
                    if (changes.update) {
                        changes.update.forEach((item) => {
                            detailedChanges.push({
                                action: 'UPDATE',
                                identifier: handler.getResourceName(item),
                                details: item,
                            });
                        });
                        updated = changes.update.length;
                    }
                    if (changes.del) {
                        changes.del.forEach((item) => {
                            detailedChanges.push({
                                action: 'DELETE',
                                identifier: handler.getResourceName(item),
                                details: item,
                            });
                        });
                        deleted = changes.del.length;
                    }
                    allChanges[handler.type] = {
                        created,
                        updated,
                        deleted,
                        changes: detailedChanges,
                    };
                }
                catch (err) {
                    err.type = handler.type;
                    err.stage = 'dryRun';
                    throw err;
                }
            })(),
        })
            .promise();
        // Restore original assets so processChanges() works correctly after dryRun()
        this.assets = savedAssets;
        if (!isDebug) {
            (0, utils_2.printCLIMessage)('');
            s.stop('Done\n');
        }
        // Build formatted table output
        const allowDelete = this.config('AUTH0_ALLOW_DELETE') === 'true' || this.config('AUTH0_ALLOW_DELETE') === true;
        const tenantDomain = this.config('AUTH0_DOMAIN');
        const inputPath = this.config('AUTH0_INPUT_FILE') || './tenant-config-directory/';
        let output = '\n';
        output += chalk_1.default.bold('Auth0 Deploy CLI - Dry Run Preview\n\n');
        output += chalk_1.default.bold('Tenant:') + ` ${tenantDomain}\n`;
        output += chalk_1.default.bold('Input:') + ` ${inputPath}\n\n`;
        output += 'Simulating deployment... The following changes are proposed:\n\n';
        const tableData = [];
        const resourceTypes = Object.keys(allChanges).sort();
        resourceTypes.forEach((type) => {
            const typeChanges = allChanges[type];
            if (typeChanges.changes.length > 0) {
                const typeName = type.charAt(0).toUpperCase() + type.slice(1);
                typeChanges.changes.forEach((change, index) => {
                    const deleteNote = change.action === 'DELETE' && !allowDelete ? ' *' : '';
                    tableData.push({
                        resource: index === 0 ? typeName : '',
                        status: change.action + deleteNote,
                        name: change.identifier,
                    });
                });
            }
        });
        if (tableData.length > 0) {
            const resourceWidth = Math.max(10, ...tableData.map((d) => d.resource.length));
            const statusWidth = Math.max(8, ...tableData.map((d) => d.status.length));
            const nameWidth = Math.max(25, ...tableData.map((d) => d.name.length));
            const widths = [resourceWidth, statusWidth, nameWidth];
            const topBorder = buildTableBorder('┌', '┬', '┐', widths);
            const headerSeparator = buildTableBorder('├', '┼', '┤', widths);
            const bottomBorder = buildTableBorder('└', '┴', '┘', widths);
            output += `${topBorder}\n`;
            output += `│ ${chalk_1.default.bold('Resource'.padEnd(resourceWidth))} │ ${chalk_1.default.bold('Status'.padEnd(statusWidth))} │ ${chalk_1.default.bold('Name / Identifier'.padEnd(nameWidth))} │\n`;
            output += `${headerSeparator}\n`;
            tableData.forEach((row) => {
                output += `│ ${row.resource.padEnd(resourceWidth)} │ ${formatStatusCell(row.status, statusWidth)} │ ${row.name.padEnd(nameWidth)} │\n`;
            });
            output += `${bottomBorder}\n`;
            if (!allowDelete && tableData.some((d) => d.status.includes('*'))) {
                output += '\n' + chalk_1.default.dim('* Requires AUTH0_ALLOW_DELETE to be enabled');
            }
        }
        else {
            output += chalk_1.default.dim('No changes detected.');
        }
        output += '\n\n';
        output += chalk_1.default.green('Dry Run completed successfully.') + '\n';
        (0, utils_2.printCLIMessage)(output);
        const hasChanges = tableData.length > 0;
        const shouldApplyAfterPreview = (0, utils_1.isTruthy)(this.config('AUTH0_DRY_RUN_APPLY'));
        if (opts.interactive && process.stdout.isTTY && !shouldApplyAfterPreview && hasChanges) {
            (0, prompts_1.intro)(chalk_1.default.inverse(' dry-run '));
            const selectedType = await (0, prompts_1.select)({
                message: 'What would you like to do?',
                options: [
                    { value: 'dry-run-apply', label: 'Apply changes' },
                    {
                        value: 'dry-run-export',
                        label: 'Export changes in a file',
                        hint: 'No Apply',
                    },
                    { value: 'dry-run-exit', label: 'Exit', hint: '' },
                ],
            });
            switch (selectedType) {
                case 'dry-run-apply':
                    (0, utils_2.printCLIMessage)('\n' + chalk_1.default.green('Applying changes...') + '\n');
                    await this.processChanges();
                    break;
                case 'dry-run-export': {
                    const fileName = 'dry-run-diff-log.json';
                    await (0, calculateDryRunChanges_1.exportDiffLog)(fileName);
                    (0, utils_2.printCLIMessage)('\n' + chalk_1.default.cyan(`Exported on ./${fileName}`) + '\n');
                    break;
                }
                case 'dry-run-exit':
                    (0, utils_2.printCLIMessage)('\n' + chalk_1.default.yellow('Deployment cancelled. No changes were made.') + '\n');
                    process.exit(0);
                    break;
                default:
                    (0, utils_2.printCLIMessage)(chalk_1.default.red('Invalid option selected.'));
                    process.exit(1);
            }
        }
        return hasChanges;
    }
}
exports.default = Auth0;
