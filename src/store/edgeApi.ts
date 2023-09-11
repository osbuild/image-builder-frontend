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
  time?: string;
  valid?: boolean;
};
export type GormDeletedAt = {
  time?: string;
  valid?: boolean;
};
export type ModelsInstalledPackage = {
  CreatedAt?: ModelsEdgeApiTime;
  DeletedAt?: GormDeletedAt;
  ID?: number;
  UpdatedAt?: ModelsEdgeApiTime;
  arch?: string;
  commits?: ModelsCommit[];
  epoch?: string;
  name?: string;
  release?: string;
  sigmd5?: string;
  signature?: string;
  type?: string;
  version?: string;
};
export type ModelsRepo = {
  CreatedAt?: ModelsEdgeApiTime;
  DeletedAt?: GormDeletedAt;
  ID?: number;
  RepoStatus?: string;
  RepoURL?: string;
  UpdatedAt?: ModelsEdgeApiTime;
};
export type ModelsCommit = {
  Account?: string;
  Arch?: string;
  BlueprintToml?: string;
  BuildDate?: string;
  BuildNumber?: number;
  ChangesRefs?: boolean;
  ComposeJobID?: string;
  CreatedAt?: ModelsEdgeApiTime;
  DeletedAt?: GormDeletedAt;
  ID?: number;
  ImageBuildHash?: string;
  ImageBuildParentHash?: string;
  ImageBuildTarURL?: string;
  InstalledPackages?: ModelsInstalledPackage[];
  OSTreeCommit?: string;
  OSTreeParentCommit?: string;
  OSTreeParentRef?: string;
  OSTreeRef?: string;
  Repo?: ModelsRepo;
  RepoID?: number;
  Status?: string;
  UpdatedAt?: ModelsEdgeApiTime;
  external?: boolean;
  name?: string;
  org_id?: string;
};
export type ModelsPackage = {
  CreatedAt?: ModelsEdgeApiTime;
  DeletedAt?: GormDeletedAt;
  ID?: number;
  Name?: string;
  UpdatedAt?: ModelsEdgeApiTime;
};
export type ModelsInstaller = {
  Account?: string;
  Checksum?: string;
  ComposeJobID?: string;
  CreatedAt?: ModelsEdgeApiTime;
  DeletedAt?: GormDeletedAt;
  ID?: number;
  ImageBuildISOURL?: string;
  SshKey?: string;
  Status?: string;
  UpdatedAt?: ModelsEdgeApiTime;
  Username?: string;
  org_id?: string;
};
export type ModelsThirdPartyRepo = {
  CreatedAt?: ModelsEdgeApiTime;
  DeletedAt?: GormDeletedAt;
  Description?: string;
  ID?: number;
  Images?: ModelsImage[];
  Name?: string;
  URL?: string;
  UpdatedAt?: ModelsEdgeApiTime;
  account?: string;
  distribution_arch?: string;
  distribution_version?: string[];
  gpg_key?: string;
  org_id?: string;
  package_count?: number;
  uuid?: string;
};
export type ModelsImage = {
  Account?: string;
  Commit?: ModelsCommit;
  CommitID?: number;
  CreatedAt?: ModelsEdgeApiTime;
  CustomPackages?: ModelsPackage[];
  DeletedAt?: GormDeletedAt;
  Description?: string;
  Distribution?: string;
  ID?: number;
  ImageSetID?: number;
  ImageType?: string;
  Installer?: ModelsInstaller;
  InstallerID?: number;
  Name?: string;
  OutputTypes?: string[];
  Packages?: ModelsPackage[];
  Status?: string;
  SystemsRunning?: number;
  ThirdPartyRepositories?: ModelsThirdPartyRepo[];
  TotalPackages?: number;
  UpdatedAt?: ModelsEdgeApiTime;
  Version?: number;
  org_id?: string;
  request_id?: string;
};
export type ModelsImageSetApi = {
  CreatedAt?: ModelsEdgeApiTime;
  DeletedAt?: GormDeletedAt;
  ID?: number;
  Images?: ModelsImage[];
  UpdatedAt?: ModelsEdgeApiTime;
  name?: string;
  version?: number;
};
export type ModelsImageSetInstallerUrlapi = {
  image_build_iso_url?: string;
  image_set?: ModelsImageSetApi;
};
export type ModelsImageSetsResponseApi = {
  Count?: number;
  Data?: ModelsImageSetInstallerUrlapi[];
};
export type ErrorsBadRequest = {
  Code?: string;
  Status?: number;
  Title?: string;
};
export type ErrorsNotFound = {
  Code?: string;
  Status?: number;
  Title?: string;
};
export type ErrorsInternalServerError = {
  Code?: string;
  Status?: number;
  Title?: string;
};
export type ModelsImageSetView = {
  Distribution?: string;
  ID?: number;
  ImageBuildIsoURL?: string;
  ImageID?: number;
  Name?: string;
  OutputTypes?: string[];
  Status?: string;
  UpdatedAt?: ModelsEdgeApiTime;
  Version?: number;
};
export type ModelsImageSetsViewResponseApi = {
  count?: number;
  data?: ModelsImageSetView[];
};
export type ModelsImageDetailApi = {
  additional_packages?: number;
  image?: ModelsImage;
  packages?: number;
  update_added?: number;
  update_removed?: number;
  update_updated?: number;
};
export type ModelsImageSetImageIdViewApi = {
  ImageBuildIsoURL?: string;
  ImageDetails?: ModelsImageDetailApi;
  ImageSet?: ModelsImageSetApi;
};
export type ModelsImageView = {
  CommitCheckSum?: string;
  CreatedAt?: ModelsEdgeApiTime;
  ID?: number;
  ImageBuildIsoURL?: string;
  ImageType?: string;
  Name?: string;
  OutputTypes?: string[];
  Status?: string;
  Version?: number;
};
export type ModelsImagesViewDataApi = {
  count?: number;
  data?: ModelsImageView[];
};
export type ModelsSuccessPlaceholderResponse = object;
export type ImageResponse = {
  Account?: string;
  Commit?: ModelsCommit;
  CommitID?: number;
  CreatedAt?: ModelsEdgeApiTime;
  CustomPackages?: ModelsPackage[];
  DeletedAt?: GormDeletedAt;
  Description?: string;
  Distribution?: string;
  ID?: number;
  ImageSetID?: number;
  ImageType?: string;
  Installer?: ModelsInstaller;
  InstallerID?: number;
  Name?: string;
  OutputTypes?: string[];
  Packages?: ModelsPackage[];
  Status?: string;
  SystemsRunning?: number;
  ThirdPartyRepositories?: ModelsThirdPartyRepo[];
  TotalPackages?: number;
  UpdatedAt?: ModelsEdgeApiTime;
  Version?: number;
  org_id?: string;
  request_id?: string;
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
