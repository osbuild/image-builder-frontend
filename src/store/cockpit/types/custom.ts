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
} from '@/store/api/backend';

import { Bootc } from './generated';

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

export type ComposerGetArchitecturesApiArg = {
  distribution: Distributions | 'image-mode';
};

export type ComposerGetOscapProfilesApiArg = {
  // NOTE: this is a workaround to get the types happy,
  // we will disable openscap for image-mode
  distribution: Distributions | 'image-mode';
};

export type ComposerGetOscapCustomizationsApiArg = {
  // NOTE: this is a workaround to get the types happy,
  // we will disable openscap for image-mode
  distribution: Distributions | 'image-mode';
  profile: DistributionProfileItem;
};

export type ComposerUploadTypes = UploadTypes | 'local';

export type ComposerAwsUploadRequestOptions = AwsUploadRequestOptions & {
  region?: string | undefined;
};

type ComposerUploadRequest = {
  type: ComposerUploadTypes;
  options: Awss3UploadRequestOptions | ComposerAwsUploadRequestOptions;
};

export type ComposerImageRequest = Omit<ImageRequest, 'upload_request'> & {
  upload_request: ComposerUploadRequest;
};

export type ComposerBlueprintResponse = Omit<
  BlueprintResponse,
  'distribution'
> & {
  distribution: Distributions | 'image-mode';
};

export type ComposerCreateBlueprintRequest = Omit<
  CreateBlueprintRequest,
  'image_requests' | 'distribution'
> & {
  distribution: Distributions | 'image-mode';
  image_requests: ComposerImageRequest[];
  bootc?: Bootc | undefined;
};

export type ComposerCreateBlueprintApiArg = Omit<
  CreateBlueprintApiArg,
  'createBlueprintRequest'
> & {
  createBlueprintRequest: ComposerCreateBlueprintRequest;
};

export type ComposerUpdateBlueprintApiArg = Omit<
  UpdateBlueprintApiArg,
  'createBlueprintRequest'
> & {
  createBlueprintRequest: ComposerCreateBlueprintRequest;
};

export type ComposerComposesResponseItem = Omit<
  ComposesResponseItem,
  'request'
> & {
  request: Omit<ComposeRequest, 'image_requests' | 'distribution'> & {
    distribution?: Distributions | 'image-mode' | undefined;
    image_requests: ComposerImageRequest[];
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
