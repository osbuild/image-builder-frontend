import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONTENT_SOURCES_API } from '../constants';

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptyContentSourcesApi = createApi({
  reducerPath: 'contentSourcesApi',
  baseQuery: fetchBaseQuery({ baseUrl: CONTENT_SOURCES_API }),
  endpoints: () => ({}),
});
