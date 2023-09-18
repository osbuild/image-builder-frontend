import React, { Suspense, useState } from 'react';

import { Button, Modal, ModalVariant, Skeleton } from '@patternfly/react-core';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useLoadModule, useScalprum } from '@scalprum/react-core';
import { useNavigate } from 'react-router-dom';

import { MODAL_ANCHOR } from '../../constants';
import {
  ComposesResponseItem,
  ComposeStatus,
  ImageTypes,
  useGetComposeStatusQuery,
} from '../../store/imageBuilderApi';
import {
  isAwsUploadRequestOptions,
  isAwss3UploadStatus,
  isGcpUploadRequestOptions,
} from '../../store/typeGuards';
import { resolveRelPath } from '../../Utilities/path';
import useProvisioningPermissions from '../../Utilities/useProvisioningPermissions';

type CloudInstancePropTypes = {
  compose: ComposesResponseItem;
};

export const CloudInstance = ({ compose }: CloudInstancePropTypes) => {
  const { initialized: chromeInitialized } = useChrome();
  const scalprum = useScalprum();
  const hasProvisioning = chromeInitialized && scalprum.config?.provisioning;

  const { data, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  if (hasProvisioning) {
    return <ProvisioningLink compose={compose} composeStatus={data} />;
  } else {
    return <DisabledProvisioningLink />;
  }
};

const DisabledProvisioningLink = () => {
  return (
    <Button variant="link" isInline isDisabled>
      Launch
    </Button>
  );
};

type ProvisioningLinkPropTypes = {
  compose: ComposesResponseItem;
  composeStatus: ComposeStatus;
};

const ProvisioningLink = ({
  compose,
  composeStatus,
}: ProvisioningLinkPropTypes) => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [exposedScalprumModule, error] = useLoadModule(
    {
      scope: 'provisioning',
      module: './ProvisioningWizard',
    },
    {}
  );

  const { permissions, isLoading: isLoadingPermission } =
    useProvisioningPermissions();

  // Recomputing this value on every render made the modal crash. Using a state
  // helps avoiding this situation as the value is only set the first time.
  const [appendTo] = useState(
    document.querySelector(MODAL_ANCHOR) as HTMLElement
  );

  if (
    error ||
    !exposedScalprumModule ||
    composeStatus.image_status.status !== 'success'
  ) {
    return <DisabledProvisioningLink />;
  } else {
    const ProvisioningWizard = exposedScalprumModule?.default;
    const provider = getImageProvider(compose);

    const options = compose.request.image_requests[0].upload_request.options;

    let sourceIds = undefined;
    let accountIds = undefined;

    if (isGcpUploadRequestOptions(options)) {
      accountIds = options.share_with_accounts;
    }

    if (isAwsUploadRequestOptions(options)) {
      accountIds = options.share_with_accounts;
      sourceIds = options.share_with_sources;
    }

    return (
      <>
        <Suspense fallback="loading...">
          <Button
            spinnerAriaLabel="Loading launch"
            isLoading={isLoadingPermission}
            variant="link"
            isInline
            onClick={() => setWizardOpen(true)}
          >
            Launch
          </Button>
          {wizardOpen && (
            <Modal
              isOpen
              hasNoBodyWrapper
              appendTo={appendTo}
              showClose={false}
              variant={ModalVariant.large}
              aria-label="Open launch wizard"
            >
              <ProvisioningWizard
                hasAccess={permissions[provider]}
                onClose={() => setWizardOpen(false)}
                image={{
                  name: compose.image_name || compose.id,
                  id: compose.id,
                  architecture: compose.request.image_requests[0].architecture,
                  provider: provider,
                  sourceIDs: sourceIds,
                  accountIDs: accountIds,
                  uploadOptions:
                    compose.request.image_requests[0].upload_request.options,
                  uploadStatus: composeStatus.image_status.upload_status,
                }}
              />
            </Modal>
          )}
        </Suspense>
      </>
    );
  }
};

const getImageProvider = (compose: ComposesResponseItem) => {
  const imageType = compose.request.image_requests[0].image_type;
  switch (imageType) {
    case 'aws':
      return 'aws';
    case 'ami':
      return 'aws';
    case 'azure':
      return 'azure';
    case 'gcp':
      return 'gcp';
    default:
      //TODO check with Provisioning: what if imageType is not 'aws', 'ami', or 'azure'?
      return 'aws';
  }
};

type AwsS3InstancePropTypes = {
  compose: ComposesResponseItem;
  isExpired: boolean;
};

export const AwsS3Instance = ({
  compose,
  isExpired,
}: AwsS3InstancePropTypes) => {
  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  const navigate = useNavigate();

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
    wsl: '.tar.gz',
    ami: '',
    'rhel-edge-commit': '',
    'rhel-edge-installer': '',
    vhd: '',
  };

  const status = composeStatus.image_status.status;
  const options = composeStatus.image_status.upload_status?.options;

  if (options && !isAwss3UploadStatus(options)) {
    throw TypeError(
      `Error: options must be of type Awss3UploadStatus, not ${typeof options}.`
    );
  }

  if (status !== 'success') {
    return (
      <Button isDisabled variant="link" isInline>
        Download ({fileExtensions[compose.request.image_requests[0].image_type]}
        )
      </Button>
    );
  } else if (!isExpired) {
    return (
      <Button
        component="a"
        target="_blank"
        variant="link"
        isInline
        href={options?.url}
      >
        Download ({fileExtensions[compose.request.image_requests[0].image_type]}
        )
      </Button>
    );
  } else if (isExpired) {
    return (
      <Button
        component="a"
        target="_blank"
        variant="link"
        onClick={() => navigate(resolveRelPath(`imagewizard/${compose.id}`))}
        isInline
      >
        Recreate image
      </Button>
    );
  }
};
