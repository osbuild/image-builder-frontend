import { Bootc } from './composerCloudApi';

import {
  Awss3UploadRequestOptions,
  AwsUploadRequestOptions,
  BlueprintResponse,
  ComposeRequest,
  ComposesResponseItem,
  CreateBlueprintApiArg,
  CreateBlueprintRequest,
  DistributionProfileItem,
  Distributions,
  ImageRequest,
  UpdateBlueprintApiArg,
  UploadTypes,
} from '../imageBuilderApi';

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

export type AWSWorkerConfig = {
  bucket?: string | undefined;
  credentials?: string | undefined;
};

export type WorkerConfigResponse = {
  aws?: AWSWorkerConfig;
};

export type WorkerConfigFile = {
  // the worker file has a key value/pair for
  // each section, which could be of any type.
  // Disable the linter warning for this.
  // eslint-disable-next-line
  [key: string]: any;
};

export type CloudProviderConfigState = {
  aws: AWSWorkerConfig;
};

export type WorkerConfigRequest = {
  aws?: AWSWorkerConfig | undefined;
};

export type UpdateWorkerConfigApiArg = {
  updateWorkerConfigRequest: WorkerConfigRequest | undefined;
};

export type GetArchitecturesApiArg = {
  distribution: Distributions | 'image-mode';
};

export type GetOscapProfilesApiArg = {
  // NOTE: this is a workaround to get the types happy,
  // we will disable openscap for image-mode
  distribution: Distributions | 'image-mode';
};

export type GetOscapCustomizationsApiArg = {
  // NOTE: this is a workaround to get the types happy,
  // we will disable openscap for image-mode
  distribution: Distributions | 'image-mode';
  profile: DistributionProfileItem;
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

export type CockpitBlueprintResponse = Omit<
  BlueprintResponse,
  'distribution'
> & {
  distribution: Distributions | 'image-mode';
};

export type CockpitCreateBlueprintRequest = Omit<
  CreateBlueprintRequest,
  'image_requests' | 'distribution'
> & {
  distribution: Distributions | 'image-mode';
  image_requests: CockpitImageRequest[];
  bootc?: Bootc | undefined;
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
  request: Omit<ComposeRequest, 'image_requests' | 'distribution'> & {
    distribution?: Distributions | 'image-mode' | undefined;
    image_requests: CockpitImageRequest[];
    bootc?: Bootc | undefined;
  };
};

export type PodmanImageInfo = {
  image: string;
  repository: string;
  tag: string;
};

export type PodmanImagesArg = void;
export type PodmanImagesResponse = PodmanImageInfo[];
