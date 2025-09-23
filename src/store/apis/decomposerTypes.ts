import {
  Awss3UploadRequestOptions,
  AwsUploadRequestOptions,
  ComposeRequest,
  ComposesResponseItem,
  CreateBlueprintApiArg,
  CreateBlueprintRequest,
  ImageRequest,
  UpdateBlueprintApiArg,
  UploadTypes,
} from './imageBuilderApi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Params = Record<string, any>;
export type Method = 'GET' | 'DELETE' | 'POST' | 'PUT' | 'PATCH'; // We can add more if we need
export type Headers = { [name: string]: string };

export type SearchRpmApiArg = {
  apiContentUnitSearchRequest: {
    architecture?: string | undefined;
    distribution?: string | undefined;
    packages?: string[] | undefined;
  };
};

export type Package = {
  name: string;
  arch: string;
  summary: string;
  version: string;
  release: string;
};

export type CockpitUploadTypes = UploadTypes | 'local';

export type CockpitAwsUploadRequestOptions = AwsUploadRequestOptions & {
  region?: string | undefined;
};

type CockpitUploadRequest = {
  type: CockpitUploadTypes;
  options: Awss3UploadRequestOptions | CockpitAwsUploadRequestOptions;
};

export type CockpitImageRequest = Omit<ImageRequest, 'upload_request'> & {
  upload_request: CockpitUploadRequest;
};

export type CockpitCreateBlueprintRequest = Omit<
  CreateBlueprintRequest,
  'image_requests'
> & {
  image_requests: CockpitImageRequest[];
};

export type CockpitCreateBlueprintApiArg = Omit<
  CreateBlueprintApiArg,
  'createBlueprintRequest'
> & {
  createBlueprintRequest: CockpitCreateBlueprintRequest;
};

export type CockpitUpdateBlueprintApiArg = Omit<
  UpdateBlueprintApiArg,
  'createBlueprintRequest'
> & {
  createBlueprintRequest: CockpitCreateBlueprintRequest;
};

export type CockpitComposesResponseItem = Omit<
  ComposesResponseItem,
  'request'
> & {
  request: Omit<ComposeRequest, 'image_requests'> & {
    image_requests: CockpitImageRequest[];
  };
};
