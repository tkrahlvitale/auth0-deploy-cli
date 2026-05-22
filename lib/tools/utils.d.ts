import { Asset, Assets, CalculatedChanges, KeywordMappings } from '../types';
import { ConfigFunction } from '../configFactory';
export declare const keywordReplaceArrayRegExp: (key: any) => RegExp;
export declare const keywordReplaceStringRegExp: (key: any) => RegExp;
export declare function keywordArrayReplace(input: string, mappings: KeywordMappings): string;
export declare function keywordStringReplace(input: string, mappings: KeywordMappings): string;
export declare function keywordReplace(input: string | undefined, mappings: KeywordMappings): string;
export declare function wrapArrayReplaceMarkersInQuotes(body: string, mappings: KeywordMappings): string;
export declare function convertClientNameToId(name: string, clients: Asset[]): string;
export declare function convertActionNameToId(name: string, actions: Asset[]): string;
export declare function convertActionIdToName(id: string, actions: Asset[]): string;
export declare function convertClientNamesToIds(names: string[], clients: Asset[]): string[];
export declare function loadFileAndReplaceKeywords(file: string, { mappings, disableKeywordReplacement, }: {
    mappings: KeywordMappings;
    disableKeywordReplacement: boolean;
}): string;
export declare function flatten(list: any[]): any[];
export declare function convertJsonToString(obj: {
    [key: string]: any;
}, spacing?: number): string;
export declare function stripFields(obj: Asset, fields: string[]): Asset;
export declare function getEnabledClients(assets: Assets, connection: Asset, existing: Asset[], clients: Asset[]): string[] | undefined;
export declare function duplicateItems(arr: Asset[], key: string): Asset[];
export declare function filterExcluded(changes: CalculatedChanges, exclude: string[]): CalculatedChanges;
export declare function filterIncluded(changes: CalculatedChanges, include: string[]): CalculatedChanges;
export declare function areArraysEquals(x: any[], y: any[]): boolean;
export declare const obfuscateSensitiveValues: (data: Asset | Asset[] | null, sensitiveFieldsToObfuscate: string[]) => Asset | Asset[] | null;
export declare const validateNoUnresolvedPlaceholders: (data: Asset | null, resourceType: string, resourceName: string) => Asset | null;
export declare const stripObfuscatedFieldsFromPayload: (data: Asset | Asset[] | null, obfuscatedFields: string[]) => Asset | Asset[] | null;
export declare const detectInsufficientScopeError: <T>(fn: Function) => Promise<{
    hadSufficientScopes: true;
    data: T;
    requiredScopes: [];
} | {
    hadSufficientScopes: false;
    requiredScopes: string[];
    data: null;
}>;
export declare function sleep(ms: number): Promise<void>;
export declare const isDeprecatedError: (err: {
    message: string;
    statusCode: number;
}) => boolean;
export declare const isForbiddenFeatureError: (err: any, type: any) => boolean;
export declare function maskSecretAtPath({ resourceTypeName, maskedKeyName, maskOnObj, keyJsonPath, }: {
    resourceTypeName: string;
    maskedKeyName: string;
    maskOnObj: object;
    keyJsonPath: string;
}): any;
/**
 * Determines whether third-party clients should be excluded based on configuration.
 * Checks the AUTH0_EXCLUDE_THIRD_PARTY_CLIENTS config value and returns true if it's
 * set to boolean true or string 'true'.
 *
 * @param configFn - The configuration function to retrieve the config value.
 * @returns True if third-party clients should be excluded, false otherwise.
 */
export declare const shouldExcludeThirdPartyClients: (configFn: (key: string) => any) => boolean;
export declare function sortGuardianFactors(factors: Asset[]): Asset[];
export declare function isDryRun(config: ConfigFunction): boolean;
export declare function printCLIMessage(message: string): void;
