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
} from '../imageBuilderApi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Params = Record<string, any>;
export type Method = 'GET' | 'DELETE' | 'POST' | 'PUT' | 'PATCH'; // We can add more if we need
export type Headers = { [name: string]: string };

export type ProcessError = {
  exit_status: number | null;
  message: string;
};

// this function serves as a type guard for the ProcessError that
// can occur in a `cockpit.spawn` command. The cockpit `ProcessError`
// has a specific structure and we may need to check the exit_status.
// This function helps narrow the types down so that we are sure the
// `exit_status` item exist.
export const isProcessError = (error: unknown): error is ProcessError => {
  const err = error as ProcessError; // cast this here just for readability
  return (
    error !== null &&
    typeof error === 'object' &&
    'exit_status' in error &&
    (typeof err.exit_status === 'number' || err.exit_status === null) &&
    'message' in error &&
    typeof err.message === 'string'
  );
};

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

export type PodmanImageExistsArg = {
  image: string;
};

export type PodmanImageExistsResponse = boolean;
