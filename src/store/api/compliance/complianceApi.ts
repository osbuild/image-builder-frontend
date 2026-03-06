import { emptyComplianceApi as api } from "./emptyComplianceApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    policies: build.query<PoliciesApiResponse, PoliciesApiArg>({
      query: (queryArg) => ({
        url: `/policies`,
        headers: {
          "X-RH-IDENTITY": queryArg["X-RH-IDENTITY"],
        },
        params: {
          limit: queryArg.limit,
          offset: queryArg.offset,
          ids_only: queryArg.idsOnly,
          sort_by: queryArg.sortBy,
          filter: queryArg.filter,
        },
      }),
    }),
    policy: build.query<PolicyApiResponse, PolicyApiArg>({
      query: (queryArg) => ({
        url: `/policies/${queryArg.policyId}`,
        headers: {
          "X-RH-IDENTITY": queryArg["X-RH-IDENTITY"],
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as complianceApi };
export type PoliciesApiResponse = /** status 200 Lists Policies */ {
  meta?: MetadataRead | undefined;
  links?: LinksRead | undefined;
  data?:
    | {
        schema?: PolicyRead | undefined;
      }[]
    | undefined;
};
export type PoliciesApiArg = {
  /** For internal use only */
  "X-RH-IDENTITY"?: string;
  /** Number of items to return per page */
  limit?: number;
  /** Offset of first item of paginated response */
  offset?: number;
  /** Indicates whether to return only resource IDs. */
  idsOnly?: boolean;
  /** Attribute and direction to sort the items by. Represented by an array of fields with an optional direction (`<key>:asc` or `<key>:desc`).<br><br>If no direction is selected, `<key>:asc` is used by default. */
  sortBy?: (
    | "title"
    | "os_major_version"
    | "total_system_count"
    | "business_objective"
    | "compliance_threshold"
    | "title:asc"
    | "title:desc"
    | "os_major_version:asc"
    | "os_major_version:desc"
    | "total_system_count:asc"
    | "total_system_count:desc"
    | "business_objective:asc"
    | "business_objective:desc"
    | "compliance_threshold:asc"
    | "compliance_threshold:desc"
  )[];
  /** Query string to filter items by their attributes. Compliant with <a href="https://github.com/wvanbergen/scoped_search/wiki/Query-language" target="_blank" title="github.com/wvanbergen/scoped_search">scoped_search query language</a>. However, only `=` or `!=` (resp. `<>`) operators are supported.<br><br>Policies are searchable using attributes `title`, `os_major_version`, and `os_minor_version`<br><br>(e.g.: `(field_1=something AND field_2!="something else") OR field_3>40`) */
  filter?: string;
};
export type PolicyApiResponse = /** status 200 Returns a Policy */ {
  data?:
    | {
        schema?: PolicyRead | undefined;
      }
    | undefined;
};
export type PolicyApiArg = {
  /** For internal use only */
  "X-RH-IDENTITY"?: string;
  policyId: string;
};
export type Metadata = {
  /** Attribute and direction the items are sorted by */
  sort_by?: string | undefined;
  /** Query string used to filter items by their attributes */
  filter?: string | undefined;
};
export type MetadataRead = {
  /** Total number of items */
  total?: number | undefined;
  /** Number of items returned per page */
  limit?: number | undefined;
  /** Offset of the first item of paginated response */
  offset?: number | undefined;
  /** Attribute and direction the items are sorted by */
  sort_by?: string | undefined;
  /** Query string used to filter items by their attributes */
  filter?: string | undefined;
};
export type Links = {};
export type LinksRead = {
  /** Link to first page */
  first?: string | undefined;
  /** Link to last page */
  last?: string | undefined;
  /** Link to previous page */
  previous?: string | undefined;
  /** Link to next page */
  next?: string | undefined;
};
export type Id = string;
export type IdRead = string;
export type Policy = {
  id?: Id | undefined;
  /** Short title of the Policy */
  title?: string | undefined;
  /** Longer description of the Policy */
  description?: string | undefined;
  /** The Business Objective associated to the Policy */
  business_objective?: string | undefined;
  /** The percentage above which the Policy meets compliance requirements */
  compliance_threshold: number;
};
export type PolicyRead = {
  id?: IdRead | undefined;
  type?: "policy" | undefined;
  /** Short title of the Policy */
  title?: string | undefined;
  /** Longer description of the Policy */
  description?: string | undefined;
  /** The Business Objective associated to the Policy */
  business_objective?: string | undefined;
  /** The percentage above which the Policy meets compliance requirements */
  compliance_threshold: number;
  /** Major version of the Operating System that the Policy covers */
  os_major_version?: number | undefined;
  /** Identificator of the Profile */
  ref_id?: string | undefined;
  /** Title of the associated Policy */
  profile_title?: string | undefined;
  /** The number of Systems assigned to this Policy */
  total_system_count?: number | undefined;
};
export type PolicyWrite = {
  id?: Id | undefined;
  /** Short title of the Policy */
  title?: string | undefined;
  /** Longer description of the Policy */
  description?: string | undefined;
  /** The Business Objective associated to the Policy */
  business_objective?: string | undefined;
  /** The percentage above which the Policy meets compliance requirements */
  compliance_threshold: number;
  /** Identifier of the underlying Profile */
  profile_id: string;
};
export type Errors = {
  errors: string[];
};
export const { usePoliciesQuery, usePolicyQuery } = injectedRtkApi;
