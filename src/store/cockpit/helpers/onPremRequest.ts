import { Blueprint } from '../composerCloudApi';
import { CockpitImageRequest } from '../types';

export const mapToOnpremRequest = (
  blueprint: Blueprint,
  distribution: string,
  image_requests: CockpitImageRequest[],
) => {
  return {
    blueprint,
    distribution,
    image_requests: image_requests.map((ir) => ({
      architecture: ir.architecture,
      image_type: ir.image_type,
      repositories: [],
      upload_targets: [
        {
          type: ir.upload_request.type,
          upload_options: ir.upload_request.options,
        },
      ],
    })),
  };
};
