import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { IMAGE_BUILDER_API, PROVISIONING_SOURCES_ENDPOINT } from '../constants';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  endpoints: (builder) => ({
    getAWSSources: builder.query({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        // The provisioning sources endpoint response does not include the account ids
        // associated with the sources. For each source, another API request must be
        // made to get the account id. This custom queryFn combines all of these API
        // requests so that the React components can call simply call a single hook,
        // useGetAWSSourcesQuery().

        const awsSources = await fetchWithBQ(
          `${PROVISIONING_SOURCES_ENDPOINT}?provider=aws`
        );

        if (awsSources.error) return { error: awsSources.error };

        const awsAccountIds = await Promise.allSettled(
          awsSources.data.map((source) =>
            fetchWithBQ(
              `${PROVISIONING_SOURCES_ENDPOINT}/${source.id}/account_identity`
            )
          )
        );

        // Merge the account ids into awsSources
        for (let i = 0; i < awsSources.data.length; i++) {
          if (awsAccountIds[i].value.error) {
            awsSources.data[i].account_id = '';
          } else {
            awsSources.data[i].account_id =
              awsAccountIds[i].value.data.aws.account_id;
          }
        }

        return awsSources;
      },
    }),
    getArchitecturesByDistribution: builder.query({
      query: (distribution) =>
        `${IMAGE_BUILDER_API}/architectures/${distribution}`,
    }),
  }),
});

export const {
  useGetAWSSourcesQuery,
  useGetArchitecturesByDistributionQuery,
  usePrefetch,
} = apiSlice;
