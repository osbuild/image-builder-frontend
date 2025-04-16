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

export type AWSWorkerConfig =
  | {
      bucket?: string | undefined;
      region?: string | undefined;
      credentials?: string | undefined;
    }
  | undefined;

export type WorkerConfigResponse = {
  aws?: AWSWorkerConfig;
};

// just use an aliase, the underlying type is the same.
// use separate names to stick to conventions and avoid
// possible confusion
export type CloudProviderConfigState = WorkerConfigResponse;
