import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import {
  CONTENT_SOURCES,
  IMAGE_BUILDER_API,
  PROVISIONING_SOURCES_ENDPOINT,
  RHSM_API,
} from '../constants';

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
    getAzureSources: builder.query({
      query: () => `${PROVISIONING_SOURCES_ENDPOINT}?provider=azure`,
    }),
    getAzureSourceDetail: builder.query({
      query: (sourceId) =>
        `${PROVISIONING_SOURCES_ENDPOINT}/${sourceId}/upload_info`,
      transformResponse: (response) => response.azure,
    }),
    getArchitecturesByDistribution: builder.query({
      query: (distribution) =>
        `${IMAGE_BUILDER_API}/architectures/${distribution}`,
    }),
    getActivationKeys: builder.query({
      query: () => `${RHSM_API}/activation_keys`,
    }),
    getActivationKeyInformation: builder.query({
      query: (activationKey) => `${RHSM_API}/activation_keys/${activationKey}`,
    }),
    getRepositories: builder.query({
      async queryFn(args, _queryApi, _extraOptions, fetchWithBQ) {
        const { available_for_arch, available_for_version } = args;
        const limit = 100;

        let repositories = await fetchWithBQ(
          `${CONTENT_SOURCES}/repositories/?available_for_arch=${available_for_arch}&available_for_version=${available_for_version}&limit=${limit}`
        );

        if (repositories.meta.count > limit) {
          repositories = await fetchWithBQ(
            `${CONTENT_SOURCES}/repositories/?available_for_arch=${available_for_arch}&available_for_version=${available_for_version}&limit=${repositories.meta.count}`
          );
        }

        return repositories;
      },
    }),
  }),
});

export const {
  useGetAWSSourcesQuery,
  useGetArchitecturesByDistributionQuery,
  useGetAzureSourcesQuery,
  useGetAzureSourceDetailQuery,
  useGetActivationKeysQuery,
  useGetActivationKeyInformationQuery,
  useGetRepositoriesQuery,
  usePrefetch,
} = apiSlice;
