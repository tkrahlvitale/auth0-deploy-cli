"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = pagedClient;
exports.paginate = paginate;
const promise_pool_executor_1 = require("promise-pool-executor");
const lodash_1 = __importDefault(require("lodash"));
const utils_1 = require("../utils");
const API_CONCURRENCY = 3;
// To ensure a complete deployment, limit the API requests generated to be 80% of the capacity
// https://auth0.com/docs/policies/rate-limits#management-api-v2
const API_FREQUENCY_PER_SECOND = 8;
const MAX_PAGE_SIZE = 100;
function getEntity(rsp) {
    // If the response is already an array, return it directly (v5 SDK behavior)
    if (Array.isArray(rsp)) {
        return rsp;
    }
    // If the response is an object, look for array properties (legacy behavior)
    if (typeof rsp === 'object' && rsp !== null) {
        const found = Object.values(rsp).filter((a) => Array.isArray(a));
        if (found.length === 1) {
            return found[0];
        }
        // If we can't find exactly one array, but there's a property that looks like it contains the data
        // Try some common property names from Auth0 SDK v5
        if ('data' in rsp && Array.isArray(rsp.data)) {
            return rsp.data;
        }
        // Handle empty response case - return empty array instead of throwing error
        if (Array.isArray(found) && found.length === 0) {
            return [];
        }
    }
    throw new Error('There was an error trying to find the entity within paginate');
}
function checkpointPaginator(client, target, name) {
    return async function (...args) {
        const data = [];
        // remove the _checkpoint_ flag
        const { checkpoint, ...newArgs } = lodash_1.default.cloneDeep(args[0]);
        // Set appropriate page size for checkpoint pagination
        newArgs.take = newArgs.take || 50; // Default to 50
        let currentPage = await client.pool
            .addSingleTask({
            data: newArgs,
            generator: (requestArgs) => target[name](requestArgs),
        })
            .promise();
        // Add first page data
        data.push(...(currentPage.data || []));
        // Continue fetching while there are more pages
        while (currentPage.hasNextPage && currentPage.hasNextPage()) {
            const pageToFetch = currentPage; // Capture the current page reference
            currentPage = await client.pool
                .addSingleTask({
                data: null,
                generator: () => pageToFetch.getNextPage(),
            })
                .promise();
            data.push(...(currentPage.data || []));
        }
        return data;
    };
}
function pagePaginator(client, target, name) {
    return async function (...args) {
        // Where the entity data will be collected
        const data = [];
        // Create new args and inject the properties we require for pagination automation
        const newArgs = [...args];
        newArgs[0] = { ...newArgs[0], page: 0 };
        // Grab data we need from the request then delete the keys as they are only needed for this automation function to work
        const perPage = newArgs[0].per_page || MAX_PAGE_SIZE;
        newArgs[0].per_page = perPage;
        delete newArgs[0].paginate;
        // Run the first request to get the total number of entity items
        const rsp = await client.pool
            .addSingleTask({
            data: lodash_1.default.cloneDeep(newArgs),
            generator: (pageArgs) => target[name](...pageArgs),
        })
            .promise();
        data.push(...getEntity(rsp.data));
        // In Auth0 SDK v5, the total is not provided
        const total = rsp.response?.total || 0;
        // If total is 0 but we have data, it likely means the response doesn't include pagination info
        // In this case, we should assume this is all the data and skip pagination
        const initialDataLength = getEntity(rsp.data).length;
        if (total === 0 && initialDataLength > 0) {
            return data; // Return what we have without pagination
        }
        const pagesLeft = Math.ceil(total / perPage) - 1;
        // Setup pool to get the rest of the pages
        if (pagesLeft > 0) {
            const pages = await client.pool
                .addEachTask({
                data: Array.from(Array(pagesLeft).keys()),
                generator: (page) => {
                    const pageArgs = lodash_1.default.cloneDeep(newArgs);
                    pageArgs[0].page = page + 1;
                    return target[name](...pageArgs).then((r) => getEntity(r.data));
                },
            })
                .promise();
            data.push(...(0, utils_1.flatten)(pages));
            // Only validate total if it was provided (non-zero)
            // In Auth0 SDK v5,endpoints don't provide total count
            if (total > 0 && data.length !== total) {
                throw new Error('Fail to load data from tenant');
            }
        }
        return data;
    };
}
// Warp around a <resource>Manager and detect when requesting specific pages to return all
function pagedManager(client, manager) {
    return new Proxy(manager, {
        get: function (target, name, receiver) {
            if (name === 'list') {
                return async function (...args) {
                    switch (true) {
                        case args[0] && typeof args[0] === 'object' && args[0].checkpoint:
                            return checkpointPaginator(client, target, name)(...args);
                        case args[0] && typeof args[0] === 'object' && args[0].paginate:
                            return pagePaginator(client, target, name)(...args);
                        default:
                            return target[name](...args);
                    }
                };
            }
            const nestedManager = Reflect.get(target, name, receiver);
            if (typeof nestedManager === 'object' && nestedManager !== null) {
                return pagedManager(client, nestedManager);
            }
            return nestedManager;
        },
    });
}
// Warp around the ManagementClient and detect when requesting specific pages to return all
function pagedClient(client) {
    // Create a new object that inherits from the original client
    const clientWithPooling = Object.create(Object.getPrototypeOf(client));
    // Copy all enumerable properties from the original client
    Object.assign(clientWithPooling, client);
    // Add the pool property
    clientWithPooling.pool = new promise_pool_executor_1.PromisePoolExecutor({
        concurrencyLimit: API_CONCURRENCY,
        frequencyLimit: API_FREQUENCY_PER_SECOND,
        frequencyWindow: 1000, // 1 sec
    });
    return pagedManager(clientWithPooling, clientWithPooling);
}
// eslint-disable-next-line no-unused-vars
async function paginate(fetchFunc, args) {
    // override default <T>.list() behaviour using pagedClient
    const allItems = (await fetchFunc(args));
    return allItems;
}
