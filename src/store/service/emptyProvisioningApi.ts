import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { PROVISIONING_API } from '../../constants';

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptyProvisioningApi = createApi({
  reducerPath: 'provisioningApi',
  baseQuery: fetchBaseQuery({
    baseUrl: window.location.origin + PROVISIONING_API,
  }),
  endpoints: () => ({}),
});
