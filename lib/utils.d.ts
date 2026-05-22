import { Auth0 } from './tools';
import { Asset, Assets, Config, KeywordMappings } from './types';
export declare function isTruthy(value: unknown): boolean;
export declare function isDirectory(filePath: string): boolean;
export declare function isFile(filePath: string): boolean;
export declare function getFiles(folder: string, exts: string[]): string[];
export declare function loadJSON(file: string, opts?: {
    disableKeywordReplacement: boolean;
    mappings: KeywordMappings;
}): any;
export declare function dumpJSON(file: string, mappings: {
    [key: string]: any;
}): void;
export declare function existsMustBeDir(folder: string): boolean;
export declare function toConfigFn(data: Config): (arg0: keyof Config) => any;
export declare function stripIdentifiers(auth0: Auth0, assets: Assets): Assets;
export declare function sanitize(str: string | undefined): string;
type ImportantFields = {
    name: string | null;
    client_id: string | null;
    audience: string | null;
    template: string | null;
    identifier: string | null;
    strategy: string | null;
    script: string | null;
    stage: string | null;
    id: string | null;
};
export declare function formatResults(item: any): Partial<ImportantFields>;
export declare function recordsSorter(a: Partial<ImportantFields>, b: Partial<ImportantFields>): number;
export declare function clearTenantFlags(tenant: Asset): void;
export declare function ensureProp(obj: Asset, props: string): void;
export declare function clearClientArrays(client: Asset): Asset;
export declare function convertClientIdToName(clientId: string | undefined, knownClients?: Asset[]): string;
export declare function hasKeywordMarkers(value: any): boolean;
export declare function mapClientID2NameSorted(enabledClients: string[] | string, knownClients: Asset[]): string[] | string;
export declare function nomalizedYAMLPath(filePath: string): string[];
export declare const findKeyPathWithValue: (obj: any, findKey: string, parentPath?: string) => {
    path: string;
    value: any;
}[];
/**
 * Encodes a certificate string to Base64 format if it starts with '-----BEGIN CERTIFICATE-----'.
 *
 * @param cert - The certificate string to be encoded.
 * @returns The Base64 encoded certificate string if the input starts with '-----BEGIN CERTIFICATE-----', otherwise returns the original string.
 */
export declare const encodeCertStringToBase64: (cert: string) => string;
export declare const decodeBase64ToCertString: (base64Cert: string) => string;
export declare const getFormattedOptions: (connection: any, clients: any) => {
    options: any;
} | {
    options?: undefined;
};
export {};
