import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { EDGE_API } from '../constants';

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptyEdgeApi = createApi({
  reducerPath: 'edgeApi',
  baseQuery: fetchBaseQuery({ baseUrl: EDGE_API }),
  endpoints: () => ({}),
});
