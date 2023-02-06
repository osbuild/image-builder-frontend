import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { PROVISIONING_SOURCES_ENDPOINT } from '../constants';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getSources: builder.query({
      query: () => PROVISIONING_SOURCES_ENDPOINT,
    }),
  }),
});

export const { useGetSourcesQuery } = apiSlice;
