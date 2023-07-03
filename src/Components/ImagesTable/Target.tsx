import { Spinner } from '@patternfly/react-core';

import {
  useGetClonesQuery,
  useGetComposeStatusQuery,
} from '../../store/apiSlice';

type TargetProps = {
  composeId: string;
};
type targetOptions = keyof typeof targetOptions;

const targetOptions = {
  aws: 'Amazon Web Services',
  azure: 'Microsoft Azure',
  gcp: 'Google Cloud Platform',
  vsphere: 'VMWare vSphere',
  'vsphere-ova': 'VMWare vSphere',
  'guest-image': 'Virtualization - Guest image',
  'image-installer': 'Bare metal - Installer',
  ami: 'Amazon Web Services',
  'edge-installer': 'edge-installer',
  'rhel-edge-commit': 'rhel-edge-commit',
  'rhel-edge-installer': 'rhel-edge-installer',
  'edge-commit': 'edge-commit',
  vhd: 'vhd',
};

const Target = ({ composeId }: TargetProps) => {
  const { data: clones, isSuccess: isSuccessClones } =
    useGetClonesQuery(composeId);
  const {
    data: composeStatus,
    isSuccess: isSuccessComposeStatus,
    isFetching,
  } = useGetComposeStatusQuery(composeId);

  let target;

  if (isSuccessComposeStatus) {
    const imageReq = composeStatus?.request?.image_requests[0];
    const imageType = imageReq?.upload_request?.type;
    if (imageType === 'aws.s3') {
      target = targetOptions[imageReq?.image_type];
    } else if (imageType === 'aws') {
      if (isSuccessClones) {
        target =
          targetOptions[imageType] +
          ` (${clones.meta.count !== 0 ? clones.meta.count + 1 : 1})`;
      }
    } else {
      target = targetOptions[imageType];
    }
  } else if (isFetching) {
    return <Spinner isSVG size="md" />;
  }
  if (target) {
    return target;
  }
  const image_type = composeStatus?.request?.image_requests[0]
    ?.image_type as targetOptions;
  return targetOptions[image_type] || null;
};

export default Target;
