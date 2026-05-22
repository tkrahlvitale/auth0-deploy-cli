/**
 * Dry-run change calculation utilities.
 *
 * This module handles all logic specific to the --dry-run mode:
 * - Comparing local vs. remote assets to detect creates, updates, and deletes
 * - Normalizing asset representations (session durations, client name→ID, profiles)
 * - Tracking and exporting a structured diff log
 *
 * The core deploy-time change calculation lives in calculateChanges.ts.
 */
import { Asset, Assets, Auth0APIClient, CalculatedChanges } from '../types';
export declare const getDiffLog: (resourceTypeName?: string) => string[] | {
    [key: string]: string[];
};
/**
 * Writes the accumulated diff log to a JSON file on disk.
 * Useful for CI pipelines that want a machine-readable dry-run report.
 */
export declare const exportDiffLog: (fileName: string, resourceTypeName?: string) => Promise<void>;
/**
 * Compares two objects and returns an array of human-readable difference strings.
 * Only considers keys present in `localObj` — extra keys in `remoteObj` are ignored.
 *
 * @param localObj - Local (desired) state
 * @param remoteObj - Remote (current) state
 * @param keyObjPath - Dot-separated JSON path used for nested tracking
 * @param resourceTypeName - Resource type label used in log output
 * @param ignoreDryRunFields - Field paths to skip during comparison
 * @returns Array of difference descriptions, empty if objects are equivalent
 */
export declare function getObjectDifferences(localObj: Record<string, any>, remoteObj: Record<string, any>, keyObjPath?: string, resourceTypeName?: string, ignoreDryRunFields?: string[]): string[];
/**
 * Returns true if `localObj` and `remoteObj` differ in any field present in
 * `localObj`. Side-effect: appends found differences to the diff log.
 */
export declare function hasObjectDifferences(localObj: Record<string, any>, remoteObj: Record<string, any>, keyObjPath?: string, resourceTypeName?: string, ignoreDryRunFields?: string[]): boolean;
/**
 * Calculates the changes required between local and remote asset sets for dry-run operations.
 *
 * Unlike `calculateChanges`, this function does not mutate assets for API consumption.
 * It is purely for reporting: determining which assets would be created, updated, or deleted.
 *
 * @param params.type - Resource type label used for logging
 * @param params.assets - Local assets to be deployed
 * @param params.existing - Remote assets currently on the tenant, or null
 * @param params.identifiers - Fields used to match local↔remote assets (default: ['id', 'name'])
 * @param params.ignoreDryRunFields - Fields to exclude from diff comparisons
 */
export declare function calculateDryRunChanges({ type, assets, existing, identifiers, ignoreDryRunFields, }: {
    type: string;
    assets: Asset[] | Asset;
    existing: Asset[] | Asset | null;
    identifiers: string[];
    ignoreDryRunFields: string[];
}): CalculatedChanges;
/**
 * Normalizes local assets so they can be accurately compared against remote assets.
 *
 * Transformations applied:
 * - Converts client name references to client IDs (clientGrants, databases, connections, resourceServers)
 * - Resolves connection profile and user attribute profile names to IDs (express_configuration)
 * - Decodes base64-encoded SAML certificates to PEM strings
 * - Resolves organization connection names to connection IDs
 * - Normalizes tenant session duration fields
 * - Removes empty branding templates (avoids false diff against remote)
 *
 * @param localAssets - Local assets object (will be mutated)
 * @param authAPIclient - Auth0 management API client for fetching remote reference data
 * @returns The mutated assets object with normalized values
 */
export declare function dryRunFormatAssets(localAssets: Assets, authAPIclient: Auth0APIClient): Promise<Assets>;
