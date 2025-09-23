import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { baseQuery as decomposerBaseQuery } from './decomposerBaseQuery';

import { IMAGE_BUILDER_API } from '../../constants';

const baseQuery = process.env.IS_ON_PREMISE
  ? decomposerBaseQuery
  : fetchBaseQuery;

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptyImageBuilderApi = createApi({
  reducerPath: 'imageBuilderApi',
  endpoints: () => ({}),
  baseQuery: baseQuery({
    baseUrl: process.env.IS_ON_PREMISE
      ? '/api/image-builder-composer/v2'
      : window.location.origin + IMAGE_BUILDER_API,
    prepareHeaders: (headers) => {
      // help the backend distinguish between requests from the UI and the API
      headers.set('X-ImageBuilder-ui', 'true');
    },
    paramsSerializer: (params) => {
      /*
       * Image builder backend requires the arrays in get requests to be
       * exploded, see the default behavior for swagger in the documentation:
       * https://swagger.io/docs/specification/serialization/
       *
       * To accommodate to that, make sure that when the request is sent with
       * an array we do explode properly unlike the default behavior of
       * URLSearchParams.
       */
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined) {
          // avoid sending undefined parameters
          continue;
        }
        if (Array.isArray(value)) {
          for (const v of value) {
            searchParams.append(key, v);
          }
        } else {
          searchParams.append(key, value);
        }
      }

      return searchParams.toString();
    },
  }),
});
