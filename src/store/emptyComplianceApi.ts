import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { COMPLIANCE_API } from '../constants';

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptyComplianceApi = createApi({
  reducerPath: 'complianceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: window.location.origin + COMPLIANCE_API,
  }),
  endpoints: () => ({}),
});
