import { IBPackageWithRepositoryInfo } from '../Components/CreateImageWizard/steps/Packages/Packages';
import { AMPLITUDE_MODULE_NAME } from '../constants';
import { CreateBlueprintRequest } from '../store/imageBuilderApi';

export const createAnalytics = (
  requestBody: CreateBlueprintRequest,
  packages: IBPackageWithRepositoryInfo[],
  isBeta: () => boolean,
) => {
  const analyticsData = {
    image_name: requestBody.name,
    description: requestBody.description,
    distribution: requestBody.distribution,
    openscap: requestBody.customizations.openscap,
    image_request_types: requestBody.image_requests.map(
      (req) => req.image_type,
    ),
    image_request_architectures: requestBody.image_requests.map(
      (req) => req.architecture,
    ),
    image_requests: requestBody.image_requests,
    organization: requestBody.customizations.subscription?.organization,
    metadata: requestBody.metadata,
    packages: packages.map((pkg) => pkg.name),
    file_system_configuration: requestBody.customizations.filesystem,
    module: AMPLITUDE_MODULE_NAME,
    is_preview: isBeta(),
  };
  return analyticsData;
};
