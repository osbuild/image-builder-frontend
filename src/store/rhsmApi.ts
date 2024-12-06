import { emptyRhsmApi as api } from "./emptyRhsmApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listActivationKeys: build.query<
      ListActivationKeysApiResponse,
      ListActivationKeysApiArg
    >({
      query: () => ({ url: `/activation_keys` }),
    }),
    createActivationKeys: build.mutation<
      CreateActivationKeysApiResponse,
      CreateActivationKeysApiArg
    >({
      query: (queryArg) => ({
        url: `/activation_keys`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    showActivationKey: build.query<
      ShowActivationKeyApiResponse,
      ShowActivationKeyApiArg
    >({
      query: (queryArg) => ({ url: `/activation_keys/${queryArg.name}` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as rhsmApi };
export type ListActivationKeysApiResponse =
  /** status 200 Array of activation keys */ {
    body?: ActivationKeys[] | undefined;
  };
export type ListActivationKeysApiArg = void;
export type CreateActivationKeysApiResponse = /** status 200 Activation key */ {
  body?: ActivationKeys | undefined;
};
export type CreateActivationKeysApiArg = {
  /** Create an activation key */
  body: {
    additionalRepositories?:
      | {
          repositoryLabel?: string | undefined;
        }[]
      | undefined;
    /** Name should be present, unique and can only contain letters, numbers, underscores, or hyphens */
    name: string;
    releaseVersion?: string | undefined;
    role?: string | undefined;
    serviceLevel?: string | undefined;
    usage?: string | undefined;
  };
};
export type ShowActivationKeyApiResponse = /** status 200 Activation key */ {
  body?: ActivationKeys | undefined;
};
export type ShowActivationKeyApiArg = {
  name: string;
};
export type AdditionalRepositories = {
  repositoryLabel?: string | undefined;
  repositoryName?: string | undefined;
};
export type ActivationKeys = {
  additionalRepositories?: AdditionalRepositories[] | undefined;
  id?: string | undefined;
  name?: string | undefined;
  releaseVersion?: string | undefined;
  role?: string | undefined;
  serviceLevel?: string | undefined;
  usage?: string | undefined;
};
export type ErrorDetails = {
  code?: number | undefined;
  message?: string | undefined;
};
export const {
  useListActivationKeysQuery,
  useCreateActivationKeysMutation,
  useShowActivationKeyQuery,
} = injectedRtkApi;
