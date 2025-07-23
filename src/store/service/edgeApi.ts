import { emptyEdgeApi as api } from "./emptyEdgeApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listAllImageSets: build.query<
      ListAllImageSetsApiResponse,
      ListAllImageSetsApiArg
    >({
      query: (queryArg) => ({
        url: `/image-sets`,
        params: {
          sort_by: queryArg.sortBy,
          name: queryArg.name,
          status: queryArg.status,
          limit: queryArg.limit,
          offset: queryArg.offset,
        },
      }),
    }),
    getImageSetsView: build.query<
      GetImageSetsViewApiResponse,
      GetImageSetsViewApiArg
    >({
      query: (queryArg) => ({
        url: `/image-sets/view`,
        params: {
          sort_by: queryArg.sortBy,
          name: queryArg.name,
          status: queryArg.status,
          id: queryArg.id,
          limit: queryArg.limit,
          offset: queryArg.offset,
        },
      }),
    }),
    getImageSetImageView: build.query<
      GetImageSetImageViewApiResponse,
      GetImageSetImageViewApiArg
    >({
      query: (queryArg) => ({
        url: `/image-sets/view/${queryArg.imageSetId}/versions/${queryArg.imageId}`,
      }),
    }),
    getAllImageSetImagesView: build.query<
      GetAllImageSetImagesViewApiResponse,
      GetAllImageSetImagesViewApiArg
    >({
      query: (queryArg) => ({
        url: `/image-sets/view/${queryArg.imageSetId}/versions`,
        params: {
          sort_by: queryArg.sortBy,
          status: queryArg.status,
          version: queryArg.version,
          limit: queryArg.limit,
          offset: queryArg.offset,
        },
      }),
    }),
    deleteImageSet: build.mutation<
      DeleteImageSetApiResponse,
      DeleteImageSetApiArg
    >({
      query: (queryArg) => ({
        url: `/image-sets/${queryArg.imageSetId}`,
        method: "DELETE",
      }),
    }),
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
    createImage: build.mutation<CreateImageApiResponse, CreateImageApiArg>({
      query: (queryArg) => ({
        url: `/images`,
        method: "POST",
        body: queryArg.createImage,
      }),
    }),
    checkImageName: build.mutation<
      CheckImageNameApiResponse,
      CheckImageNameApiArg
    >({
      query: (queryArg) => ({
        url: `/images/checkImageName`,
        method: "POST",
        body: queryArg.createImage,
      }),
    }),
    createInstallerForImage: build.mutation<
      CreateInstallerForImageApiResponse,
      CreateInstallerForImageApiArg
    >({
      query: (queryArg) => ({
        url: `/images/${queryArg.imageId}/installer`,
        method: "POST",
        body: queryArg.createImage,
      }),
    }),
    createKickStartForImage: build.mutation<
      CreateKickStartForImageApiResponse,
      CreateKickStartForImageApiArg
    >({
      query: (queryArg) => ({
        url: `/images/${queryArg.imageId}/kickstart`,
        method: "POST",
        body: queryArg.createImage,
      }),
    }),
    getMetadataForImage: build.query<
      GetMetadataForImageApiResponse,
      GetMetadataForImageApiArg
    >({
      query: (queryArg) => ({ url: `/images/${queryArg.imageId}/metadata` }),
    }),
    getRepoForImage: build.query<
      GetRepoForImageApiResponse,
      GetRepoForImageApiArg
    >({
      query: (queryArg) => ({ url: `/images/${queryArg.imageId}/repo` }),
    }),
    retryCreateImage: build.mutation<
      RetryCreateImageApiResponse,
      RetryCreateImageApiArg
    >({
      query: (queryArg) => ({
        url: `/images/${queryArg.imageId}/retry`,
        method: "POST",
        body: queryArg.createImage,
      }),
    }),
    createImageUpdate: build.mutation<
      CreateImageUpdateApiResponse,
      CreateImageUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/images/${queryArg.imageId}/update`,
        method: "POST",
        body: queryArg.createImage,
      }),
    }),
    getImageByOstree: build.query<
      GetImageByOstreeApiResponse,
      GetImageByOstreeApiArg
    >({
      query: (queryArg) => ({
        url: `/images/${queryArg.ostreeCommitHash}/info`,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as edgeApi };
export type ListAllImageSetsApiResponse =
  /** status 200 OK */ ModelsImageSetsResponseApi;
export type ListAllImageSetsApiArg = {
  /** Define sort fields: created_at, updated_at, name. To sort DESC use - */
  sortBy?: string;
  /** field: filter by name */
  name?: string;
  /** field: filter by status */
  status?: string;
  /** field: return number of image-set view until limit is reached. Default is 100. */
  limit?: number;
  /** field: return number of image-set view beginning at the offset. */
  offset?: number;
};
export type GetImageSetsViewApiResponse =
  /** status 200 OK */ ModelsImageSetsViewResponseApi;
export type GetImageSetsViewApiArg = {
  /** Define sort fields: created_at, updated_at, name. To sort DESC use - */
  sortBy?: string;
  /** field: filter by name */
  name?: string;
  /** field: filter by status */
  status?: string;
  /** field: filter by id */
  id?: number;
  /** field: return number of image-set view until limit is reached. Default is 30. */
  limit?: number;
  /** field: return number of image-set view beginning at the offset. */
  offset?: number;
};
export type GetImageSetImageViewApiResponse =
  /** status 200 OK */ ModelsImageSetImageIdViewApi;
export type GetImageSetImageViewApiArg = {
  /** the image set id */
  imageSetId: number;
  /** the image id */
  imageId: number;
};
export type GetAllImageSetImagesViewApiResponse =
  /** status 200 OK */ ModelsImagesViewDataApi;
export type GetAllImageSetImagesViewApiArg = {
  /** the image-set id */
  imageSetId: number;
  /** Define sort fields: created_at, version, To sort DESC use - */
  sortBy?: string;
  /** field: filter by status */
  status?: string;
  /** field: filter by version */
  version?: string;
  /** field: return number of images until limit is reached. Default is 100. */
  limit?: number;
  /** field: return number of images beginning at the offset. */
  offset?: number;
};
export type DeleteImageSetApiResponse = /** status 200 OK */ ModelsImageSetApi;
export type DeleteImageSetApiArg = {
  /** Identifier of the ImageSet */
  imageSetId: number;
};
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
export type CreateImageApiResponse = /** status 200 OK */ ImageResponse;
export type CreateImageApiArg = {
  /** request body */
  createImage: CreateImage;
};
export type CheckImageNameApiResponse =
  /** status 200 OK */ ModelsSuccessPlaceholderResponse;
export type CheckImageNameApiArg = {
  /** request body */
  createImage: CreateImage;
};
export type CreateInstallerForImageApiResponse =
  /** status 200 OK */ ModelsSuccessPlaceholderResponse;
export type CreateInstallerForImageApiArg = {
  /** Image ID */
  imageId: number;
  /** request body */
  createImage: CreateImage;
};
export type CreateKickStartForImageApiResponse =
  /** status 200 OK */ ModelsSuccessPlaceholderResponse;
export type CreateKickStartForImageApiArg = {
  /** Image ID */
  imageId: number;
  /** request body */
  createImage: CreateImage;
};
export type GetMetadataForImageApiResponse =
  /** status 200 OK */ ModelsSuccessPlaceholderResponse;
export type GetMetadataForImageApiArg = {
  /** Image ID */
  imageId: number;
};
export type GetRepoForImageApiResponse =
  /** status 200 OK */ ModelsSuccessPlaceholderResponse;
export type GetRepoForImageApiArg = {
  /** Image ID */
  imageId: number;
};
export type RetryCreateImageApiResponse =
  /** status 201 Retry is being processed */ ModelsSuccessPlaceholderResponse;
export type RetryCreateImageApiArg = {
  /** Image ID */
  imageId: number;
  /** request body */
  createImage: CreateImage;
};
export type CreateImageUpdateApiResponse =
  /** status 200 OK */ ModelsSuccessPlaceholderResponse;
export type CreateImageUpdateApiArg = {
  /** Image ID */
  imageId: number;
  /** request body */
  createImage: CreateImage;
};
export type GetImageByOstreeApiResponse =
  /** status 200 OK */ ModelsSuccessPlaceholderResponse;
export type GetImageByOstreeApiArg = {
  /** Ostree Commit Hash */
  ostreeCommitHash: string;
};
export type ModelsEdgeApiTime = {
  time?: string | undefined;
  /** Valid is true if Time is not NULL */
  valid?: boolean | undefined;
};
export type GormDeletedAt = {
  time?: string | undefined;
  /** Valid is true if Time is not NULL */
  valid?: boolean | undefined;
};
export type ModelsInstalledPackage = {
  ID?: number | undefined;
  arch?: string | undefined;
  commits?: ModelsCommit[] | undefined;
  epoch?: string | undefined;
  name?: string | undefined;
  release?: string | undefined;
  sigmd5?: string | undefined;
  signature?: string | undefined;
  type?: string | undefined;
  version?: string | undefined;
};
export type ModelsRepo = {
  CreatedAt?: ModelsEdgeApiTime | undefined;
  DeletedAt?: GormDeletedAt | undefined;
  ID?: number | undefined;
  /** AWS repo upload status */
  RepoStatus?: string | undefined;
  /** AWS repo URL */
  RepoURL?: string | undefined;
  UpdatedAt?: ModelsEdgeApiTime | undefined;
  /** Pulp Repo ID (used for updates) */
  pulp_repo_id?: string | undefined;
  /** Status of Pulp repo import */
  pulp_repo_status?: string | undefined;
  /** Distribution URL returned from Pulp */
  pulp_repo_url?: string | undefined;
};
export type ModelsCommit = {
  Account?: string | undefined;
  Arch?: string | undefined;
  BlueprintToml?: string | undefined;
  BuildDate?: string | undefined;
  BuildNumber?: number | undefined;
  ChangesRefs?: boolean | undefined;
  ComposeJobID?: string | undefined;
  CreatedAt?: ModelsEdgeApiTime | undefined;
  DeletedAt?: GormDeletedAt | undefined;
  ID?: number | undefined;
  ImageBuildHash?: string | undefined;
  ImageBuildParentHash?: string | undefined;
  ImageBuildTarURL?: string | undefined;
  InstalledPackages?: ModelsInstalledPackage[] | undefined;
  OSTreeCommit?: string | undefined;
  OSTreeParentCommit?: string | undefined;
  OSTreeParentRef?: string | undefined;
  OSTreeRef?: string | undefined;
  Repo?: ModelsRepo | undefined;
  RepoID?: number | undefined;
  Status?: string | undefined;
  UpdatedAt?: ModelsEdgeApiTime | undefined;
  external?: boolean | undefined;
  name?: string | undefined;
  org_id?: string | undefined;
};
export type ModelsPackage = {
  CreatedAt?: ModelsEdgeApiTime | undefined;
  DeletedAt?: GormDeletedAt | undefined;
  ID?: number | undefined;
  Name?: string | undefined;
  UpdatedAt?: ModelsEdgeApiTime | undefined;
};
export type ModelsInstaller = {
  Account?: string | undefined;
  Checksum?: string | undefined;
  ComposeJobID?: string | undefined;
  CreatedAt?: ModelsEdgeApiTime | undefined;
  DeletedAt?: GormDeletedAt | undefined;
  ID?: number | undefined;
  ImageBuildISOURL?: string | undefined;
  SshKey?: string | undefined;
  Status?: string | undefined;
  UpdatedAt?: ModelsEdgeApiTime | undefined;
  Username?: string | undefined;
  org_id?: string | undefined;
};
export type ModelsThirdPartyRepo = {
  CreatedAt?: ModelsEdgeApiTime | undefined;
  DeletedAt?: GormDeletedAt | undefined;
  Description?: string | undefined;
  ID?: number | undefined;
  Images?: ModelsImage[] | undefined;
  Name?: string | undefined;
  URL?: string | undefined;
  UpdatedAt?: ModelsEdgeApiTime | undefined;
  account?: string | undefined;
  distribution_arch?: string | undefined;
  distribution_version?: string[] | undefined;
  gpg_key?: string | undefined;
  org_id?: string | undefined;
  package_count?: number | undefined;
  uuid?: string | undefined;
};
export type ModelsImage = {
  Account?: string | undefined;
  Commit?: ModelsCommit | undefined;
  CommitID?: number | undefined;
  CreatedAt?: ModelsEdgeApiTime | undefined;
  CustomPackages?: ModelsPackage[] | undefined;
  DeletedAt?: GormDeletedAt | undefined;
  Description?: string | undefined;
  Distribution?: string | undefined;
  ID?: number | undefined;
  /** TODO: Wipe staging database and set to not nullable */
  ImageSetID?: number | undefined;
  /** TODO: Remove as soon as the frontend stops using */
  ImageType?: string | undefined;
  Installer?: ModelsInstaller | undefined;
  InstallerID?: number | undefined;
  Name?: string | undefined;
  OutputTypes?: string[] | undefined;
  Packages?: ModelsPackage[] | undefined;
  Status?: string | undefined;
  /** only for forms */
  SystemsRunning?: number | undefined;
  ThirdPartyRepositories?: ModelsThirdPartyRepo[] | undefined;
  /** only for forms */
  TotalPackages?: number | undefined;
  UpdatedAt?: ModelsEdgeApiTime | undefined;
  Version?: number | undefined;
  activationKey?: string | undefined;
  org_id?: string | undefined;
  /** storing for logging reference on resume */
  request_id?: string | undefined;
};
export type ModelsImageSetApi = {
  CreatedAt?: ModelsEdgeApiTime | undefined;
  DeletedAt?: GormDeletedAt | undefined;
  ID?: number | undefined;
  /** images of image set */
  Images?: ModelsImage[] | undefined;
  UpdatedAt?: ModelsEdgeApiTime | undefined;
  /** the image set name */
  name?: string | undefined;
  /** the image set version */
  version?: number | undefined;
};
export type ModelsImageSetInstallerUrlapi = {
  /** The image-set latest available image ISO */
  image_build_iso_url?: string | undefined;
  /** image set data */
  image_set?: ModelsImageSetApi | undefined;
};
export type ModelsImageSetsResponseApi = {
  /** count of image-sets */
  Count?: number | undefined;
  /** all data of image-sets */
  Data?: ModelsImageSetInstallerUrlapi[] | undefined;
};
export type ErrorsBadRequest = {
  Code?: string | undefined;
  Status?: number | undefined;
  Title?: string | undefined;
};
export type ErrorsNotFound = {
  Code?: string | undefined;
  Status?: number | undefined;
  Title?: string | undefined;
};
export type ErrorsInternalServerError = {
  Code?: string | undefined;
  Status?: number | undefined;
  Title?: string | undefined;
};
export type ModelsImageSetView = {
  Distribution?: string | undefined;
  ID?: number | undefined;
  ImageBuildIsoURL?: string | undefined;
  ImageID?: number | undefined;
  Name?: string | undefined;
  OutputTypes?: string[] | undefined;
  Status?: string | undefined;
  UpdatedAt?: ModelsEdgeApiTime | undefined;
  Version?: number | undefined;
};
export type ModelsImageSetsViewResponseApi = {
  /** count of image-sets */
  count?: number | undefined;
  /** data of image set view */
  data?: ModelsImageSetView[] | undefined;
};
export type ModelsImageDetailApi = {
  /** Number of additional packages */
  additional_packages?: number | undefined;
  image?: ModelsImage | undefined;
  /** Number of packages */
  packages?: number | undefined;
  /** Number of added update */
  update_added?: number | undefined;
  /** Number of removed update */
  update_removed?: number | undefined;
  /** Number of updated update */
  update_updated?: number | undefined;
};
export type ModelsImageSetImageIdViewApi = {
  /** The image-set latest available image ISO */
  ImageBuildIsoURL?: string | undefined;
  /** the requested image details */
  ImageDetails?: ModelsImageDetailApi | undefined;
  /** image set data */
  ImageSet?: ModelsImageSetApi | undefined;
};
export type ModelsImageView = {
  CommitCheckSum?: string | undefined;
  CreatedAt?: ModelsEdgeApiTime | undefined;
  ID?: number | undefined;
  ImageBuildIsoURL?: string | undefined;
  ImageType?: string | undefined;
  Name?: string | undefined;
  OutputTypes?: string[] | undefined;
  Status?: string | undefined;
  Version?: number | undefined;
};
export type ModelsImagesViewDataApi = {
  /** total number of image view data */
  count?: number | undefined;
  data?: ModelsImageView[] | undefined;
};
export type ModelsSuccessPlaceholderResponse = object;
export type ImageResponse = {
  Account?: string | undefined;
  Commit?: ModelsCommit | undefined;
  CommitID?: number | undefined;
  CreatedAt?: ModelsEdgeApiTime | undefined;
  CustomPackages?: ModelsPackage[] | undefined;
  DeletedAt?: GormDeletedAt | undefined;
  Description?: string | undefined;
  Distribution?: string | undefined;
  ID?: number | undefined;
  /** TODO: Wipe staging database and set to not nullable */
  ImageSetID?: number | undefined;
  /** TODO: Remove as soon as the frontend stops using */
  ImageType?: string | undefined;
  Installer?: ModelsInstaller | undefined;
  InstallerID?: number | undefined;
  Name?: string | undefined;
  OutputTypes?: string[] | undefined;
  Packages?: ModelsPackage[] | undefined;
  Status?: string | undefined;
  /** only for forms */
  SystemsRunning?: number | undefined;
  ThirdPartyRepositories?: ModelsThirdPartyRepo[] | undefined;
  /** only for forms */
  TotalPackages?: number | undefined;
  UpdatedAt?: ModelsEdgeApiTime | undefined;
  Version?: number | undefined;
  activationKey?: string | undefined;
  org_id?: string | undefined;
  /** storing for logging reference on resume */
  request_id?: string | undefined;
};
export type CreateImage = object;
export const {
  useListAllImageSetsQuery,
  useGetImageSetsViewQuery,
  useGetImageSetImageViewQuery,
  useGetAllImageSetImagesViewQuery,
  useDeleteImageSetMutation,
  useGetAllImagesQuery,
  useCreateImageMutation,
  useCheckImageNameMutation,
  useCreateInstallerForImageMutation,
  useCreateKickStartForImageMutation,
  useGetMetadataForImageQuery,
  useGetRepoForImageQuery,
  useRetryCreateImageMutation,
  useCreateImageUpdateMutation,
  useGetImageByOstreeQuery,
} = injectedRtkApi;
