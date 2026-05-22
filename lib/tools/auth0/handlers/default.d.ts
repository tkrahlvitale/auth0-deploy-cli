import { Asset, Assets, Auth0APIClient, CalculatedChanges } from '../../../types';
import { ConfigFunction } from '../../../configFactory';
export declare function order(value: any): (t: any, n: any, descriptor: any) => any;
type ApiMethodOverride = string | Function;
export default class APIHandler {
    config: ConfigFunction;
    id: string;
    type: string;
    updated: number;
    created: number;
    deleted: number;
    existing: null | Asset | Asset[];
    client: Auth0APIClient;
    identifiers: string[];
    objectFields: string[];
    sensitiveFieldsToObfuscate: string[];
    stripUpdateFields: string[];
    stripCreateFields: string[];
    name?: string;
    functions: {
        list: ApiMethodOverride;
        update: ApiMethodOverride;
        create: ApiMethodOverride;
        delete: ApiMethodOverride;
    };
    ignoreDryRunFields: string[];
    constructor(options: {
        id?: APIHandler['id'];
        config: ConfigFunction;
        type: APIHandler['type'];
        client: Auth0APIClient;
        objectFields?: APIHandler['objectFields'];
        identifiers?: APIHandler['identifiers'];
        stripUpdateFields?: APIHandler['stripUpdateFields'];
        sensitiveFieldsToObfuscate?: APIHandler['sensitiveFieldsToObfuscate'];
        stripCreateFields?: APIHandler['stripCreateFields'];
        functions: {
            list?: ApiMethodOverride;
            update?: ApiMethodOverride;
            create?: ApiMethodOverride;
            delete?: ApiMethodOverride;
        };
        ignoreDryRunFields: APIHandler['ignoreDryRunFields'];
    });
    /**
     * Returns the effective `ignoreDryRunFields` for this handler, merging the
     * handler's hardcoded defaults with any user-supplied entries from the
     * `AUTH0_IGNORE_DRY_RUN_FIELDS[<type>]` config key. Read lazily so that the
     * constructor remains free of config-provider invocations.
     */
    getEffectiveIgnoreDryRunFields(): string[];
    getClientFN(fn: ApiMethodOverride): Function;
    didDelete(item: Asset): void;
    didCreate(item: Asset): void;
    didUpdate(item: Asset): void;
    objString(item: Asset): string;
    getResourceName(item: Asset): string;
    getType(): Promise<Asset | Asset[] | null>;
    load(): Promise<{
        [key: string]: Asset | Asset[] | null;
    }>;
    calcChanges(assets: Assets): Promise<CalculatedChanges>;
    dryRunChanges(assets: Assets): Promise<CalculatedChanges>;
    validate(assets: Assets): Promise<void>;
    processChanges(assets: Assets, changes: CalculatedChanges): Promise<void>;
}
export {};
