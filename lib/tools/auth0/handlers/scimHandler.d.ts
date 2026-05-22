import { PromisePoolExecutor } from 'promise-pool-executor';
import { Management } from 'auth0';
import { Asset } from '../../../types';
interface ScimBodyParams {
    user_id_attribute: string;
    mapping: {
        scim: string;
        auth0: string;
    }[];
}
/**
 * The current version of this sdk use `node-auth0` v3. But `SCIM` features are not natively supported by v3.
 * This is a workaround to make this SDK support SCIM without `node-auth0` upgrade.
 */
export default class ScimHandler {
    private idMap;
    private readonly scimStrategies;
    private config;
    private connectionsManager;
    private scimScopes;
    private scopeMethodMap;
    private scimClient;
    private poolClient;
    constructor(config: any, connectionsManager: any, poolClient: PromisePoolExecutor);
    /**
     * Check if the connection strategy is SCIM supported.
     * Only few of the enterprise connections are SCIM supported.
     */
    isScimStrategy(strategy: string): boolean;
    /**
     * Creates connection_id -> { strategy, scimConfiguration } map.
     * Store only the SCIM ids available on the existing / remote config.
     * Payload received on `create` and `update` methods has the property `strategy` stripped.
     * So, we need this map to perform `create`, `update` or `delete` actions on SCIM.
     * @param connections
     */
    createIdMap(connections: Asset[]): Promise<void>;
    /**
     * Iterate through all the connections and add property `scim_configuration` to only `SCIM` connections.
     * The following conditions should be met to have `scim_configuration` set to a `connection`.
     * 1. Connection `strategy` should be one of `scimStrategies`
     * 2. Connection should have `SCIM` enabled.
     *
     * This method mutates the incoming `connections`.
     */
    applyScimConfiguration(connections: Asset[]): Promise<Asset[] | undefined>;
    /**
     * Wrapper over scimClient methods.
     */
    /**
     * Error handler wrapper.
     */
    withErrorHandling(callback: any, method: string, connectionId: string): Promise<any>;
    /**
     * Handle expected errors.
     */
    handleExpectedErrors(error: any, method: string, connectionId: string): null;
    /**
     * Creates a new `SCIM` configuration.
     */
    createScimConfiguration(id: string, { user_id_attribute, mapping }: ScimBodyParams): Promise<Asset | null>;
    /**
     * Retrieves `SCIM` configuration of an enterprise connection.
     */
    getScimConfiguration(id: string): Promise<Management.GetScimConfigurationResponseContent | null>;
    /**
     * Updates an existing `SCIM` configuration.
     */
    updateScimConfiguration(id: string, { user_id_attribute, mapping }: ScimBodyParams): Promise<Asset | null>;
    /**
     * Deletes an existing `SCIM` configuration.
     */
    deleteScimConfiguration(id: string): Promise<Asset | null>;
    updateOverride(connectionId: string, bodyParams: Asset): Promise<Management.UpdateConnectionResponseContent>;
    createOverride(bodyParams: Asset): Promise<Management.CreateConnectionResponseContent>;
}
export {};
