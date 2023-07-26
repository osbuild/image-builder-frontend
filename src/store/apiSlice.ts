import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { RepositoryCollectionResponse, SourceResponse, SourceUploadInfoResponse } from '../../types';

type GetRepositoriesArgs = { available_for_arch: string, available_for_version: string, limit: number, offset: number }

enum Provider {
  'azure',
  'aws'
}

import {
  CONTENT_SOURCES,
  PROVISIONING_SOURCES_ENDPOINT,
} from '../constants';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  endpoints: (builder) => ({
    getSources: builder.query<SourceResponse[], Provider>({
      query: (provider) => `${PROVISIONING_SOURCES_ENDPOINT}/sources?provider=${provider}`,
    }),
    getSourceDetail: builder.query<SourceUploadInfoResponse, string>({
      query: (sourceId) =>
        `${PROVISIONING_SOURCES_ENDPOINT}/sources/${sourceId}/upload_info`
    }),
    getRepositories: builder.query<RepositoryCollectionResponse, GetRepositoriesArgs>({
      query: ({available_for_arch, available_for_version, limit, offset}) => `${CONTENT_SOURCES}/repositories/?available_for_arch=${available_for_arch}&available_for_version=${available_for_version}&limit=${limit}&offset=${offset}`,
    }),
  }),
});

export const {
  useGetRepositoriesQuery,
  useGetSourcesQuery,
  useGetSourceDetailQuery,
  usePrefetch,
} = apiSlice;
