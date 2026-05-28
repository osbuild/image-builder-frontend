import {
  Awss3UploadRequestOptions,
  AwsUploadRequestOptions,
  ComposeRequest,
  ComposesResponseItem,
  CreateBlueprintApiArg,
  CreateBlueprintRequest,
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

export type ComposerCreateBlueprintRequest = Omit<
  CreateBlueprintRequest,
  'image_requests'
> & {
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
    distribution?: Distributions | undefined;
    image_requests: ComposerImageRequest[];
    bootc?: Bootc | undefined;
  };
};

type PodmanLabels = {
  // let's just hardcode this for now, we don't have any
  // rpm builds for other arches for the on-prem frontend
  architecture: 'x86_64' | 'aarch64';
  version: string;
  ['redhat.id']?: string | undefined;
  ['containers.bootc']?: '0' | '1' | undefined;
};

export type PodmanImageInfo = {
  Labels?: PodmanLabels | undefined;
  Names?: string[] | undefined;
};

export type ValidatedPodmanImage = {
  Labels: PodmanLabels;
  Names: string[];
};
