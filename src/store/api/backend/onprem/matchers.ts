import { composerApi } from './enhancedComposerApi';

export const matchGetHostInfoFulfilled = process.env.IS_ON_PREMISE
  ? composerApi.endpoints.getHostInfo.matchFulfilled
  : () => false;
