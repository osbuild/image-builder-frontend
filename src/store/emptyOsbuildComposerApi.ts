import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { OSBUILD_COMPOSER_API } from '../constants';

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptyOsbuildComposerApi = createApi({
    reducerPath: 'osbuildComposerApi',
    baseQuery: fetchBaseQuery({
        baseUrl: window.location.origin + OSBUILD_COMPOSER_API,
    }),
    endpoints: () => ({}),
});
