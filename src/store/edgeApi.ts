import { emptyEdgeApi as api } from './emptyEdgeApi';
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllImages: build.query<GetAllImagesApiResponse, GetAllImagesApiArg>({
      query: (queryArg) => ({
        url: `/images`,
        params: {
          limit: queryArg.limit,
          offset: queryArg.offset,
          sort_by: queryArg.sortBy,
          name: queryArg.name,
          status: queryArg.status,
          distribution: queryArg.distribution,
          created_at: queryArg.createdAt,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as edgeApi };
export type GetAllImagesApiResponse =
  /** status 200 OK */ ModelsSuccessPlaceholderResponse;
export type GetAllImagesApiArg = {
  /** Return number of images until limit is reached. */
  limit?: number;
  /** Return number of images beginning at the offset */
  offset?: number;
  /** created_at, distribution, name,status. To sort DESC use -before the fields */
  sortBy?: string;
  /** Filter by name. */
  name?: string;
  /** Filter by status. */
  status?: string;
  /** Filter by distribution. */
  distribution?: string;
  /** Filter by creation date. */
  createdAt?: string;
};
export type ModelsSuccessPlaceholderResponse = object;
export type ErrorsBadRequest = {
  Code?: string;
  Status?: number;
  Title?: string;
};
export type ErrorsInternalServerError = {
  Code?: string;
  Status?: number;
  Title?: string;
};
export const { useGetAllImagesQuery } = injectedRtkApi;
