import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { RHSM_API } from '../../constants';

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptyRhsmApi = createApi({
  reducerPath: 'rhsmApi',
  baseQuery: fetchBaseQuery({ baseUrl: window.location.origin + RHSM_API }),
  endpoints: () => ({}),
});
