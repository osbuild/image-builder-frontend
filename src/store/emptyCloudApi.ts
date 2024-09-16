import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CLOUD_API } from '../constants';

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptyCloudApi = createApi({
    reducerPath: 'cloudApi',
    baseQuery: fetchBaseQuery({ baseUrl: window.location.origin + CLOUD_API }),
    endpoints: () => ({}),
});
