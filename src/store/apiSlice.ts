import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import {
  ActivationKeys,
  Architectures,
  ClonesResponse,
  ComposeStatus,
  ComposesResponse,
  RepositoryCollectionResponse,
  SourceResponse,
  SourceUploadInfoResponse,
  UploadStatus,
} from '../../types';

type GetRepositoriesArgs = {
  available_for_arch: string;
  available_for_version: string;
  limit: number;
  offset: number;
};

enum Provider {
  'azure',
  'aws',
}

import {
  CONTENT_SOURCES,
  IMAGE_BUILDER_API,
  PROVISIONING_SOURCES_ENDPOINT,
  RHSM_API,
} from '../constants';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  endpoints: (builder) => ({
    getSources: builder.query<SourceResponse[], Provider>({
      query: (provider) =>
        `${PROVISIONING_SOURCES_ENDPOINT}/sources?provider=${provider}`,
    }),
    getSourceDetail: builder.query<SourceUploadInfoResponse, string>({
      query: (sourceId) =>
        `${PROVISIONING_SOURCES_ENDPOINT}/sources/${sourceId}/upload_info`,
    }),
    getArchitecturesByDistribution: builder.query<Architectures, string>({
      query: (distribution) =>
        `${IMAGE_BUILDER_API}/architectures/${distribution}`,
    }),
    getActivationKeys: builder.query<ActivationKeys[], void>({
      query: () => `${RHSM_API}/activation_keys`,
    }),
    getActivationKeyInformation: builder.query<ActivationKeys, string>({
      query: (name) => `${RHSM_API}/activation_keys/${name}`,
    }),
    getRepositories: builder.query<
      RepositoryCollectionResponse,
      GetRepositoriesArgs
    >({
      query: ({ available_for_arch, available_for_version, limit, offset }) =>
        `${CONTENT_SOURCES}/repositories/?available_for_arch=${available_for_arch}&available_for_version=${available_for_version}&limit=${limit}&offset=${offset}`,
    }),
    getClones: builder.query<ClonesResponse, string>({
      query: (composeId) => `${IMAGE_BUILDER_API}/composes/${composeId}/clones`,
    }),
    getCloneStatus: builder.query<UploadStatus, string>({
      query: (cloneId) => `${IMAGE_BUILDER_API}/clones/${cloneId}`,
    }),
    getComposes: builder.query<ComposesResponse, void>({
      query: () => `${IMAGE_BUILDER_API}/composes`,
    }),
    getComposeStatus: builder.query<ComposeStatus, string>({
      query: (composeId) => `${IMAGE_BUILDER_API}/composes/${composeId}`,
    }),
  }),
});

export const {
  useGetArchitecturesByDistributionQuery,
  useGetActivationKeysQuery,
  useGetActivationKeyInformationQuery,
  useGetRepositoriesQuery,
  useGetClonesQuery,
  useGetCloneStatusQuery,
  useGetComposesQuery,
  useGetComposeStatusQuery,
  useGetSourcesQuery,
  useGetSourceDetailQuery,
  usePrefetch,
} = apiSlice;
