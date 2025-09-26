import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { baseQuery as decomposerBaseQuery } from './decomposerBaseQuery';

import { CONTENT_SOURCES_API } from '../../constants';

const baseQuery = process.env.IS_ON_PREMISE
  ? decomposerBaseQuery
  : fetchBaseQuery;

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptyContentSourcesApi = createApi({
  reducerPath: 'contentSourcesApi',
  endpoints: () => ({}),
  baseQuery: baseQuery({
    baseUrl: window.location.origin + CONTENT_SOURCES_API,
  }),
});
