import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const emptyCockpitApi = createApi({
  reducerPath: 'cockpitApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Composes'],
  endpoints: () => ({}),
});
