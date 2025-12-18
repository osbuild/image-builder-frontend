import React from 'react';

import path from 'path';

import { Button, Skeleton } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import cockpit from 'cockpit';

import { AMPLITUDE_MODULE_NAME } from '../../constants';
import { useIsOnPremise } from '../../Hooks';
import { useGetComposeStatusQuery } from '../../store/backendApi';
import { LocalUploadStatus } from '../../store/cockpit/composerCloudApi';
import { ComposesResponseItem, ImageTypes } from '../../store/imageBuilderApi';
import { isAwss3UploadStatus } from '../../store/typeGuards';

type AwsS3InstancePropTypes = {
  compose: ComposesResponseItem;
  isExpired: boolean;
};

export const AwsS3Instance = ({
  compose,
  isExpired,
}: AwsS3InstancePropTypes) => {
  const { analytics } = useChrome();
  const isOnPremise = useIsOnPremise();

  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  const fileExtensions: { [key in ImageTypes]: string } = {
    aws: '',
    azure: '',
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
    'pxe-tar-xz': '',
    'network-installer': '',
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

type LocalInstancePropTypes = {
  compose: ComposesResponseItem;
};

export const LocalInstance = ({ compose }: LocalInstancePropTypes) => {
  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });
  if (!isSuccess) {
    return <Skeleton />;
  }

  const status = composeStatus.image_status.status;
  const options = composeStatus.image_status.upload_status
    ?.options as unknown as LocalUploadStatus;

  if (status !== 'success') {
    return <></>;
  }

  const parsedPath = path.parse(options.artifact_path);
  const href = '/files#/?path=' + encodeURIComponent(parsedPath.dir);
  return (
    <Button
      component='a'
      target='_blank'
      variant='link'
      onClick={async (ev) => {
        ev.preventDefault();
        // Make sure the file is readable for the user, the artefact
        // directory is created as 700 by default.
        await cockpit.spawn(['chmod', '755', parsedPath.dir], {
          superuser: 'try',
        });
        cockpit.jump(href, cockpit.transport.host);
      }}
      href={href}
      isInline
    >
      Open in file browser
    </Button>
  );
};
