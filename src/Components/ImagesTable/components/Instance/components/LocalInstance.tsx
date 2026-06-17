import React from 'react';

import path from 'path';

import { Button, Skeleton } from '@patternfly/react-core';
import cockpit from 'cockpit';

import {
  ComposesResponseItem,
  ImageTypes,
  LocalUploadStatus,
  useGetComposeStatusQuery,
} from '@/store/api/backend';

import { useCockpitMachinesAvailable } from '../../../../../Hooks';
import { hasBootcRequest } from '../../../../../store/typeGuards';
import {
  bootcReferenceToOSShortId,
  distributionToOSShortId,
} from '../../../../../Utilities/distributionToOSShortId';

// Image types that can be imported into cockpit-machines as VM disk images
const VM_IMPORTABLE_IMAGE_TYPES: ImageTypes[] = ['guest-image'];

// Image types that can be used as installation media in cockpit-machines
const VM_INSTALLABLE_IMAGE_TYPES: ImageTypes[] = [
  'bootable-container-iso',
  'image-installer',
  'network-installer',
];

type LocalInstancePropTypes = {
  compose: ComposesResponseItem;
};

const LocalInstance = ({ compose }: LocalInstancePropTypes) => {
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
      Create VM
    </Button>
  );
};

export default LocalInstance;
