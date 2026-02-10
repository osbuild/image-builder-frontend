import React from 'react';

import path from 'path';

import { Button, Skeleton } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import cockpit from 'cockpit';

import { AMPLITUDE_MODULE_NAME } from '../../constants';
import { useCockpitMachinesAvailable } from '../../Hooks';
import { useGetComposeStatusQuery } from '../../store/backendApi';
import { LocalUploadStatus } from '../../store/cockpit/composerCloudApi';
import { selectIsOnPremise } from '../../store/envSlice';
import { useAppSelector } from '../../store/hooks';
import { ComposesResponseItem, ImageTypes } from '../../store/imageBuilderApi';
import { hasBootcRequest, isAwss3UploadStatus } from '../../store/typeGuards';
import {
  bootcReferenceToOSShortId,
  distributionToOSShortId,
} from '../../Utilities/distributionToOSShortId';

type AwsS3InstancePropTypes = {
  compose: ComposesResponseItem;
  isExpired: boolean;
};

export const AwsS3Instance = ({
  compose,
  isExpired,
}: AwsS3InstancePropTypes) => {
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

type LocalInstancePropTypes = {
  compose: ComposesResponseItem;
};

// Image types that can be imported into cockpit-machines as VM disk images
const VM_IMPORTABLE_IMAGE_TYPES: ImageTypes[] = ['guest-image'];

// Image types that can be used as installation media in cockpit-machines
const VM_INSTALLABLE_IMAGE_TYPES: ImageTypes[] = [
  'image-installer',
  'network-installer',
];

export const LocalInstance = ({ compose }: LocalInstancePropTypes) => {
  const isMachinesAvailable = useCockpitMachinesAvailable();
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
  const fileBrowserHref = '/files#/?path=' + encodeURIComponent(parsedPath.dir);

  // Check if this image type can be imported or installed in a VM
  const imageType = compose.request.image_requests[0]?.image_type;
  const canLaunchInMachines =
    isMachinesAvailable && VM_IMPORTABLE_IMAGE_TYPES.includes(imageType);
  const canInstallInMachines =
    isMachinesAvailable && VM_INSTALLABLE_IMAGE_TYPES.includes(imageType);

  // Parameters for cockpit-machines (derive OS from distribution or, for image mode, from bootc reference)
  const bootcCompose = hasBootcRequest(compose) ? compose : undefined;
  const bootcRef = bootcCompose?.request.bootc?.reference;
  const dist = compose.request.distribution;
  const osShortId =
    distributionToOSShortId(dist) ||
    (bootcRef && bootcReferenceToOSShortId(bootcRef)) ||
    undefined;
  const vmName = (compose.request as unknown as { name?: string }).name || '';

  // Build cockpit-machines URLs for Create VM dialog
  const encodedSource = encodeURIComponent(options.artifact_path);
  const launchHref =
    '/machines#?action=create&type=cloud&source=' +
    encodedSource +
    (osShortId ? '&os=' + encodeURIComponent(osShortId) : '') +
    (vmName ? '&name=' + encodeURIComponent(vmName) : '');
  const installHref =
    '/machines#?action=create&type=file&source=' +
    encodedSource +
    (osShortId ? '&os=' + encodeURIComponent(osShortId) : '') +
    (vmName ? '&name=' + encodeURIComponent(vmName) : '');

  if (!canLaunchInMachines && !canInstallInMachines) {
    return (
      <Button
        component='a'
        target='_blank'
        variant='link'
        onClick={(ev) => {
          ev.preventDefault();
          cockpit.jump(fileBrowserHref, cockpit.transport.host);
        }}
        href={fileBrowserHref}
        isInline
      >
        Open in file browser
      </Button>
    );
  }

  const href = canLaunchInMachines ? launchHref : installHref;

  return (
    <Button
      component='a'
      target='_blank'
      variant='link'
      onClick={(ev) => {
        ev.preventDefault();
        cockpit.jump(href, cockpit.transport.host);
      }}
      href={href}
      isInline
    >
      Create VM
    </Button>
  );
};
