import { decomposerApi } from './apis/enhancedDecomposerApi';
import { imageBuilderApi } from './apis/enhancedImageBuilderApi';
export * from './apis/imageBuilderApi';

export const useBackendPrefetch = process.env.IS_ON_PREMISE
  ? decomposerApi.usePrefetch
  : imageBuilderApi.usePrefetch;

export const backendApi = process.env.IS_ON_PREMISE
  ? decomposerApi
  : imageBuilderApi;
