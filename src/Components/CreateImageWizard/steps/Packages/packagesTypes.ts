import { ApiSearchRpmResponse } from '../../../../store/contentSourcesApi';
import { Package } from '../../../../store/imageBuilderApi';

export type PackageRepository = 'distro' | 'custom' | 'recommended' | '';

export type ItemWithSources = {
  name: Package['name'];
  summary: Package['summary'];
  repository: PackageRepository;
  sources?: ApiSearchRpmResponse['package_sources'];
};

export type IBPackageWithRepositoryInfo = {
  name: Package['name'];
  summary: Package['summary'];
  repository: PackageRepository;
  type?: string;
  module_name?: string;
  stream?: string;
  end_date?: string;
};

export type GroupWithRepositoryInfo = {
  name: string;
  description: string;
  repository: PackageRepository;
  package_list?: string[];
};

export enum Repos {
  INCLUDED = 'included-repos',
  OTHER = 'other-repos',
}
