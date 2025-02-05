import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const emptyComposerCloudApi = createApi({
  reducerPath: 'cloudApi',
  // this basequery is just a placeholder, we don't actually use this
  // api for any queries
  baseQuery: fetchBaseQuery({ baseUrl: window.location.origin }),
  endpoints: () => ({}),
});
