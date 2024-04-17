import { ListFeaturesApiResponse } from '../../store/contentSourcesApi';

export const mockedFeatureResponse: ListFeaturesApiResponse = {
  admintasks: {
    enabled: true,
    accessible: false,
  },
  newrepositoryfiltering: {
    enabled: false,
    accessible: false,
  },
  snapshots: {
    enabled: true,
    accessible: true,
  },
};
