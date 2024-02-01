import { RootState, store } from '../../../store';
import {
  AwsUploadRequestOptions,
  CreateBlueprintRequest,
  Customizations,
  GcpUploadRequestOptions,
  ImageRequest,
  ImageTypes,
  Subscription,
  UploadTypes,
} from '../../../store/imageBuilderApi';
import {
  selectActivationKey,
  selectArchitecture,
  selectAwsAccountId,
  selectAwsShareMethod,
  selectAwsSource,
  selectBaseUrl,
  selectBlueprintDescription,
  selectBlueprintName,
  selectCustomRepositories,
  selectDistribution,
  selectGcpAccountType,
  selectGcpEmail,
  selectGcpShareMethod,
  selectImageTypes,
  selectRegistrationType,
  selectServerUrl,
} from '../../../store/wizardSlice';

/**
 * This function maps the wizard state to a valid CreateBlueprint request object
 * @param {string} orgID organization ID
 * @returns {CreateBlueprintRequest} blueprint creation request payload
 */
export const mapRequestFromState = (orgID: string): CreateBlueprintRequest => {
  const state = store.getState();
  const imageRequests = getImageRequests(state);
  const customizations = getCustomizations(state, orgID);

  return {
    name: selectBlueprintName(state),
    description: selectBlueprintDescription(state),
    distribution: selectDistribution(state),
    image_requests: imageRequests,
    customizations,
  };
};

const getImageRequests = (state: RootState): ImageRequest[] => {
  const imageTypes = selectImageTypes(state);
  return imageTypes.map((type) => ({
    architecture: selectArchitecture(state),
    image_type: type,
    upload_request: {
      type: uploadTypeByTargetEnv(type),
      options: getImageOptions(type, state),
    },
  }));
};

const uploadTypeByTargetEnv = (imageType: ImageTypes): UploadTypes => {
  switch (imageType) {
    case 'aws':
      return 'aws';
    case 'gcp':
      return 'gcp';
    case 'azure':
      return 'azure';
    case 'oci':
      return 'oci.objectstorage';
    case 'wsl':
      return 'aws.s3';
    case 'image-installer':
      return 'aws.s3';
    case 'vsphere':
      return 'aws.s3';
    case 'ami':
      return 'aws';
    default: {
      // TODO: add edge type
      throw new Error(`image type: ${imageType} has no implementation yet`);
    }
  }
};
const getImageOptions = (
  imageType: ImageTypes,
  state: RootState
): AwsUploadRequestOptions | GcpUploadRequestOptions => {
  switch (imageType) {
    case 'aws':
      if (selectAwsShareMethod(state) === 'sources')
        return { share_with_sources: [selectAwsSource(state)?.id || ''] };
      else return { share_with_accounts: [selectAwsAccountId(state)] };
    case 'gcp': {
      let googleAccount: string = '';
      if (selectGcpShareMethod(state) === 'withGoogle') {
        const gcpEmail = selectGcpEmail(state);
        switch (selectGcpAccountType(state)) {
          case 'google':
            googleAccount = `user:${gcpEmail}`;
            break;
          case 'service':
            googleAccount = `serviceAccount:${gcpEmail}`;
            break;
          case 'group':
            googleAccount = `group:${gcpEmail}`;
            break;
          case 'domain':
            googleAccount = `domain:${gcpEmail}`;
        }
        return { share_with_accounts: [googleAccount] };
      } else {
        // TODO: GCP withInsights is not implemented yet
        return {};
      }
    }
  }
  return {};
};

const getCustomizations = (state: RootState, orgID: string): Customizations => {
  return {
    containers: undefined,
    directories: undefined,
    files: undefined,
    subscription: getSubscription(state, orgID),
    packages: undefined,
    payload_repositories: undefined,
    custom_repositories: selectCustomRepositories(state),
    openscap: undefined,
    filesystem: undefined,
    users: undefined,
    services: undefined,
    hostname: undefined,
    kernel: undefined,
    groups: undefined,
    timezone: undefined,
    locale: undefined,
    firewall: undefined,
    installation_device: undefined,
    fdo: undefined,
    ignition: undefined,
    partitioning_mode: undefined,
    fips: undefined,
  };
};

const getSubscription = (state: RootState, orgID: string): Subscription => {
  const initialSubscription = {
    'activation-key': selectActivationKey(state) || '',
    organization: Number(orgID),
    'server-url': selectServerUrl(state),
    'base-url': selectBaseUrl(state),
  };
  switch (selectRegistrationType(state)) {
    case 'register-now-insights':
      return { ...initialSubscription, insights: true };
    case 'register-now-rhc':
      return { ...initialSubscription, insights: true, rhc: true };
    default:
      return { ...initialSubscription, insights: false };
  }
};
