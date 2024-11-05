import { emptyProvisioningApi as api } from "./emptyProvisioningApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSourceList: build.query<GetSourceListApiResponse, GetSourceListApiArg>({
      query: (queryArg) => ({
        url: `/sources`,
        params: {
          provider: queryArg.provider,
        },
      }),
    }),
    getSourceUploadInfo: build.query<
      GetSourceUploadInfoApiResponse,
      GetSourceUploadInfoApiArg
    >({
      query: (queryArg) => ({ url: `/sources/${queryArg.id}/upload_info` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as provisioningApi };
export type GetSourceListApiResponse =
  /** status 200 Returned on success. */ V1ListSourceResponse;
export type GetSourceListApiArg = {
  provider?: "aws" | "azure" | "gcp";
};
export type GetSourceUploadInfoApiResponse =
  /** status 200 Return on success. */ V1SourceUploadInfoResponse;
export type GetSourceUploadInfoApiArg = {
  /** Source ID from Sources Database */
  id: number;
};
export type V1ListSourceResponse = {
  data?: {
    id?: string;
    name?: string;
    source_type_id?: string;
    uid?: string;
  }[];
};
export type V1ResponseError = {
  build_time?: string;
  edge_id?: string;
  environment?: string;
  error?: string;
  msg?: string;
  trace_id?: string;
  version?: string;
};
export type V1SourceUploadInfoResponse = {
  aws?: {
    account_id?: string;
  } | null;
  azure?: {
    resource_groups?: string[];
    subscription_id?: string;
    tenant_id?: string;
  } | null;
  gcp?: any | null;
  provider?: string;
};
export const { useGetSourceListQuery, useGetSourceUploadInfoQuery } =
  injectedRtkApi;
