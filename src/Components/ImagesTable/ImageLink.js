import React, { Suspense, useState, useMemo } from 'react';

import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useLoadModule, useScalprum } from '@scalprum/react-core';
import { useFlag } from '@unleash/proxy-client-react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import ImageLinkDirect from './ImageLinkDirect';

import { MODAL_ANCHOR } from '../../constants';
import { selectImageById } from '../../store/composesSlice';
import { useGetEnvironment } from '../../Utilities/useGetEnvironment';

const getImageProvider = ({ imageType }) => {
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

const ProvisioningLink = ({ imageId, isExpired, isInClonesTable }) => {
  const image = useSelector((state) => selectImageById(state, imageId));

  const [wizardOpen, openWizard] = useState(false);
  const [{ default: ProvisioningWizard }, error] = useLoadModule(
    {
      appName: 'provisioning', // optional
      scope: 'provisioning',
      module: './ProvisioningWizard',
      // processor: (val) => val, // optional
    },
    {},
    {}
  );

  const appendTo = useMemo(() => document.querySelector(MODAL_ANCHOR), []);

  const provider = getImageProvider(image);
  if (!error) {
    return (
      <Suspense fallback="loading...">
        <Button variant="link" isInline onClick={() => openWizard(true)}>
          Launch
        </Button>
        {wizardOpen && (
          <Modal
            isOpen
            modalVariant={ModalVariant.large}
            hasNoBodyWrapper
            appendTo={appendTo}
            showClose={false}
            variant={'large'}
          >
            <ProvisioningWizard
              onClose={() => openWizard(false)}
              image={{
                name: image.imageName,
                id: image.id,
                architecture: image.architecture,
                provider: provider,
                sourceIDs: image.share_with_sources,
                accountIDs: image.share_with_accounts,
                uploadOptions: image.uploadOptions,
                uploadStatus: image.uploadStatus,
                // For backward compatibility only, remove once Provisioning ready (deploys):
                // https://github.com/RHEnVision/provisioning-frontend/pull/238
                sourceId: image.share_with_sources?.[0],
              }}
            />
          </Modal>
        )}
      </Suspense>
    );
  }

  return (
    <ImageLinkDirect
      imageId={image.id}
      isExpired={isExpired}
      isInClonesTable={isInClonesTable}
    />
  );
};

const ImageLink = ({ imageId, isExpired, isInClonesTable }) => {
  const image = useSelector((state) => selectImageById(state, imageId));
  const uploadStatus = image.uploadStatus;
  const { initialized: chromeInitialized } = useChrome();
  const { isBeta } = useGetEnvironment();
  const azureFeatureFlag = useFlag('provisioning.azure');
  const gcpFeatureFlag = useFlag('provisioning.gcp');
  const scalprum = useScalprum();
  const hasProvisioning =
    chromeInitialized && scalprum.config?.provisioning && isBeta();

  if (!uploadStatus || image.status !== 'success') return null;

  const provisioningLinkEnabled = (image) => {
    switch (image.imageType) {
      case 'aws':
      case 'ami':
        return true;
      case 'azure':
        return !!azureFeatureFlag;
      case 'gcp':
        return !!gcpFeatureFlag;
      default:
        return false;
    }
  };

  if (hasProvisioning && provisioningLinkEnabled(image)) {
    if (isInClonesTable) {
      return null;
    }

    return (
      <ProvisioningLink
        imageId={image.id}
        isExpired={isExpired}
        isInClonesTable={isInClonesTable}
      />
    );
  }

  return (
    <ImageLinkDirect
      imageId={image.id}
      isExpired={isExpired}
      isInClonesTable={isInClonesTable}
    />
  );
};

ProvisioningLink.propTypes = {
  imageId: PropTypes.string,
  isExpired: PropTypes.bool,
  isInClonesTable: PropTypes.bool,
};

ImageLink.propTypes = {
  imageId: PropTypes.string.isRequired,
  isExpired: PropTypes.bool,
  isInClonesTable: PropTypes.bool,
};

export default ImageLink;
