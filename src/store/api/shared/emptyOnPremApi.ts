import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from './baseQuery';

// NOTE: RTK Query requires endpoints that share a backend to use the same API
// slice to properly manage caching and request deduplication, for on-prem,
// all queries share the same base URL and unix socket. We can re-export this
// function with a new name for the modules that need it.
export const emptyOnPremApi = createApi({
  reducerPath: 'onPremApi',
  baseQuery: baseQuery({
    baseUrl: '/api/image-builder-composer/v2',
  }),
  endpoints: () => ({}),
});
