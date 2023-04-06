import React, { Suspense, useState } from 'react';

import { Button } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useLoadModule, useScalprum } from '@scalprum/react-core';
import { useFlag } from '@unleash/proxy-client-react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import ImageLinkDirect from './ImageLinkDirect';

import { selectImageById } from '../../store/composesSlice';

const getImageProvider = ({ imageType }) => {
  switch (imageType) {
    case 'aws' || 'ami':
      return 'aws';
    case 'azure':
      return 'azure';
    default:
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

  const provider = getImageProvider(image);
  if (!error) {
    return (
      <Suspense fallback="loading...">
        <Button variant="link" isInline onClick={() => openWizard(true)}>
          Launch
        </Button>
        {wizardOpen && (
          <ProvisioningWizard
            isOpen
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
  const {
    initialized: chromeInitialized,
    isBeta,
    getEnvironment,
  } = useChrome();
  const azureFeatureFlag = useFlag('provisioning.azure');

  const scalprum = useScalprum();
  const hasProvisioning =
    chromeInitialized &&
    scalprum.config?.provisioning &&
    (isBeta() || getEnvironment() === 'qa');

  if (!uploadStatus || image.status !== 'success') return null;

  const provisioningLinkEnabled = (image) => {
    switch (getImageProvider(image)) {
      case 'aws':
        return !!image.share_with_sources;
      case 'azure':
        return !!azureFeatureFlag;
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
