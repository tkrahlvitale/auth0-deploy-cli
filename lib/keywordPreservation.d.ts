import { AssetTypes, KeywordMappings } from './types';
import APIHandler from './tools/auth0/handlers/default';
export declare const doesHaveKeywordMarker: (string: string | undefined, keywordMappings: KeywordMappings) => boolean;
export declare const getPreservableFieldsFromAssets: (asset: object, keywordMappings: KeywordMappings, resourceSpecificIdentifiers: Partial<Record<AssetTypes, string | string[]>>, address?: string) => string[];
export declare const getAssetsValueByAddress: (address: string, assets: any) => any;
export declare const convertAddressToDotNotation: (assets: any, address: string, finalAddressTrail?: string) => string | null;
export declare const updateAssetsByAddress: (assets: object, address: string, newValue: string) => object;
export declare const preserveKeywords: ({ localAssets, remoteAssets, keywordMappings, auth0Handlers, }: {
    localAssets: object;
    remoteAssets: object;
    keywordMappings: KeywordMappings;
    auth0Handlers: (Pick<APIHandler, "id" | "type"> & {
        identifiers: (string | string[])[];
    })[];
}) => object;
