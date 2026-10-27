import {
  CustomRepository,
  Module,
  Package,
  Repository,
} from '@/store/api/backend';
import { ApiSearchRpmResponse } from '@/store/api/contentSources';

export type CustomRepositoryWithFlag = CustomRepository & {
  isRecommended?: boolean;
};

export type PayloadRepositoryWithFlag = Repository & {
  isRecommended?: boolean;
};

export type IBPackageWithSources = {
  name: Package['name'];
  summary: Package['summary'];
  isRecommendedRepository?: boolean;
  sources?: ApiSearchRpmResponse['package_sources'];
};

export type IBPackage = {
  name: Package['name'];
  summary: Package['summary'];
  isRecommendedRepository?: boolean;
  type?: string;
  module_name?: string;
  stream?: string;
  end_date?: string;
  isRecommendation?: boolean;
};

export type IBPackageGroup = {
  name: string;
  description: string;
  isRecommendedRepository?: boolean;
  package_list: string[];
};

export type ContentSlice = {
  repositories: {
    customRepositories: CustomRepositoryWithFlag[];
    payloadRepositories: PayloadRepositoryWithFlag[];
    redHatRepositories: Repository[];
  };
  packages: IBPackage[];
  enabledModules: Module[];
  groups: IBPackageGroup[];
  snapshotting: {
    useLatest: boolean;
    snapshotDate: string;
    template: string;
    templateName: string;
  };
  verifiedLocaleLangpacks: string[];
};
