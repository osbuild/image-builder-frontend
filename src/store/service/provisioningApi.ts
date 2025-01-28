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
  data?:
    | {
        id?: string | undefined;
        name?: string | undefined;
        source_type_id?: string | undefined;
        uid?: string | undefined;
      }[]
    | undefined;
};
export type V1ResponseError = {
  build_time?: string | undefined;
  edge_id?: string | undefined;
  environment?: string | undefined;
  error?: string | undefined;
  msg?: string | undefined;
  trace_id?: string | undefined;
  version?: string | undefined;
};
export type V1SourceUploadInfoResponse = {
  aws?:
    | ({
        account_id?: string | undefined;
      } | null)
    | undefined;
  azure?:
    | ({
        resource_groups?: string[] | undefined;
        subscription_id?: string | undefined;
        tenant_id?: string | undefined;
      } | null)
    | undefined;
  gcp?: (any | null) | undefined;
  provider?: string | undefined;
};
export const { useGetSourceListQuery, useGetSourceUploadInfoQuery } =
  injectedRtkApi;
