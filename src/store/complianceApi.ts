import { emptyComplianceApi as api } from "./emptyComplianceApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listProfiles: build.query<ListProfilesApiResponse, ListProfilesApiArg>({
      query: (queryArg) => ({
        url: `/profiles`,
        headers: { "X-RH-IDENTITY": queryArg["X-RH-IDENTITY"] },
        params: {
          limit: queryArg.limit,
          offset: queryArg.offset,
          search: queryArg.search,
          sort_by: queryArg.sortBy,
          include: queryArg.include,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as complianceApi };
export type ListProfilesApiResponse = unknown;
export type ListProfilesApiArg = {
  "X-RH-IDENTITY"?: string;
  /** The number of items to return */
  limit?: number;
  /** The number of items to skip before starting to collect the result set */
  offset?: number;
  /** Query string compliant with scoped_search query language: https://github.com/wvanbergen/scoped_search/wiki/Query-language */
  search?: string;
  /** A string or an array of fields with an optional direction (:asc or :desc) to sort the results. */
  sortBy?: string[] | string;
  /** A comma seperated list of resources to include in the response */
  include?: string;
};
export const { useListProfilesQuery } = injectedRtkApi;
