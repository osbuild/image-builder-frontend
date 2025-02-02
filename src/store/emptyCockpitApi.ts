import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from './cockpit/baseQuery';

export const emptyCockpitApi = createApi({
  reducerPath: 'cockpitApi',
  baseQuery: baseQuery({
    baseUrl: '/api/image-builder-composer/v2',
  }),
  endpoints: () => ({}),
});
