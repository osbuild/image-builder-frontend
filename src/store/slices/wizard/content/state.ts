import { ContentSlice } from './types';

export const initialState: ContentSlice = {
  repositories: {
    customRepositories: [],
    payloadRepositories: [],
    redHatRepositories: [],
  },
  packages: [],
  enabledModules: [],
  groups: [],
  snapshotting: {
    useLatest: true,
    snapshotDate: '',
    template: '',
    templateName: '',
  },
  verifiedLocaleLangpacks: [],
};
