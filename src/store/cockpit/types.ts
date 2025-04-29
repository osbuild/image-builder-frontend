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
