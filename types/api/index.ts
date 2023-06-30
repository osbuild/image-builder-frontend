import { components as contentSourcesComponents } from './contentSourcesSchema';
import { components as imageBuilderComponents } from './imageBuilderSchema';
import { components as provisioningComponents } from './provisioningSchema';
import { components as rhsmComponents } from './rhsmSchema';

export type ActivationKeys = rhsmComponents['schemas']['ActivationKeys'];
export type Architectures = imageBuilderComponents['schemas']['Architectures'];
export type ClonesResponse =
  imageBuilderComponents['schemas']['ClonesResponse'];
export type ComposeStatus = imageBuilderComponents['schemas']['ComposeStatus'];
export type ComposesResponse =
  imageBuilderComponents['schemas']['ComposesResponse'];
export type UploadStatus = imageBuilderComponents['schemas']['UploadStatus'];
export type SourceResponse =
  provisioningComponents['schemas']['v1.SourceResponse'];
export type SourceUploadInfoResponse =
  provisioningComponents['schemas']['v1.SourceUploadInfoResponse'];
export type RepositoryCollectionResponse =
  contentSourcesComponents['schemas']['api.RepositoryCollectionResponse'];
export type Distributions = imageBuilderComponents['schemas']['Distributions'];

export type ImageStatus = imageBuilderComponents['schemas']['ImageStatus']
