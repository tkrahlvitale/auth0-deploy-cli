import { Config } from './types';
type SharedParams = {
    proxy_url?: string;
    debug?: boolean;
    config_file?: string;
    env?: boolean;
    secret?: string;
    base_path?: string;
    config?: Partial<Config>;
    experimental_ea?: boolean;
};
export type DryRunMode = 'preview';
type ImportSpecificParams = {
    input_file: string;
    dry_run?: boolean | '' | DryRunMode;
    interactive?: boolean;
    apply?: boolean;
};
type ExportSpecificParams = {
    format: 'yaml' | 'directory';
    output_folder: string;
    export_ids?: boolean;
    export_ordered?: boolean;
};
export type ExportParams = ExportSpecificParams & SharedParams;
export type ImportParams = ImportSpecificParams & SharedParams;
export type CliParams = (ExportParams | ImportParams) & {
    _: ['export' | 'import' | 'deploy' | 'dump'];
};
declare function getParams(): CliParams;
declare const _default: {
    getParams: typeof getParams;
};
export default _default;
export { getParams };
