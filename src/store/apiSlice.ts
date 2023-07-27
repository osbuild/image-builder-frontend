import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { SourceResponse, SourceUploadInfoResponse } from '../../types';

enum Provider {
  'azure',
  'aws'
}

import {
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
  }),
});

export const {
  useGetSourcesQuery,
  useGetSourceDetailQuery,
  usePrefetch,
} = apiSlice;
