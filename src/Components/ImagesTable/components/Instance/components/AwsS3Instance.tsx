import React from 'react';

import { Button, Skeleton } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import {
  ComposesResponseItem,
  ImageTypes,
  useGetComposeStatusQuery,
} from '@/store/api/backend';
import { selectIsOnPremise } from '@/store/slices/env';

import { AMPLITUDE_MODULE_NAME } from '../../../../../constants';
import { useAppSelector } from '../../../../../store/hooks';
import { isAwss3UploadStatus } from '../../../../../store/typeGuards';

type AwsS3InstancePropTypes = {
  compose: ComposesResponseItem;
  isExpired: boolean;
};

const AwsS3Instance = ({ compose, isExpired }: AwsS3InstancePropTypes) => {
  const { analytics } = useChrome();
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  const fileExtensions: { [key in ImageTypes]: string } = {
    aws: '',
    azure: '',
    'bootable-container-iso': '.iso',
    'edge-commit': '',
    'edge-installer': '',
    gcp: '',
    'guest-image': '.qcow2',
    'image-installer': '.iso',
    vsphere: '.vmdk',
    'vsphere-ova': '.ova',
    wsl: '.wsl',
    ami: '',
    'rhel-edge-commit': '',
    'rhel-edge-installer': '',
    vhd: '',
    oci: '',
    'pxe-tar-xz': '.tar.xz',
    'network-installer': '.iso',
  };

  const status = composeStatus.image_status.status;
  const options = composeStatus.image_status.upload_status?.options;

  if (options && !isAwss3UploadStatus(options)) {
    throw TypeError(
      `Error: options must be of type Awss3UploadStatus, not ${typeof options}.`,
    );
  }

  if (status !== 'success') {
    return (
      <Button component='a' isDisabled variant='link' isInline>
        Download ({fileExtensions[compose.request.image_requests[0].image_type]}
        )
      </Button>
    );
  }

  return (
    <Button
      component='a'
      target='_blank'
      variant='link'
      isInline
      href={options?.url}
      isDisabled={isExpired}
      onClick={() => {
        if (!isOnPremise) {
          analytics.track(`${AMPLITUDE_MODULE_NAME} - Image Downloaded`, {
            module: AMPLITUDE_MODULE_NAME,
            blueprint_id: compose.blueprint_id,
            blueprint_version: compose.blueprint_version,
            image_type: compose.request.image_requests[0].image_type,
          });
        }
      }}
    >
      Download ({fileExtensions[compose.request.image_requests[0].image_type]})
    </Button>
  );
};

export default AwsS3Instance;
