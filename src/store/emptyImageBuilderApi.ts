import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { IMAGE_BUILDER_API } from '../constants';

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptyImageBuilderApi = createApi({
  reducerPath: 'imageBuilderApi',
  baseQuery: fetchBaseQuery({ baseUrl: IMAGE_BUILDER_API }),
  endpoints: () => ({}),
});
