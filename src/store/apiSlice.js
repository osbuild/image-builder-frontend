import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getSources: builder.query({
      query: () => '/provisioning/v1/sources',
    }),
  }),
});

export const { useGetSourcesQuery } = apiSlice;
