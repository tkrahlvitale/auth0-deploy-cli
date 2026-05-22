import { ManagementClient } from 'auth0';
import { Auth0APIClient, CheckpointPaginationParams, PagePaginationParams } from '../../types';
export default function pagedClient(client: ManagementClient): Auth0APIClient;
export declare function paginate<T>(fetchFunc: (...paginateArgs: any) => any, args: PagePaginationParams | CheckpointPaginationParams): Promise<T[]>;
