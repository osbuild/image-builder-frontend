import React, { Suspense, useState } from 'react';

import { Button } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useLoadModule, useScalprum } from '@scalprum/react-core';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import ImageLinkDirect from './ImageLinkDirect';

import { selectImageById } from '../../store/composesSlice';

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

  if (!error) {
    return (
      <Suspense fallback="loading">
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

  const scalprum = useScalprum();
  const hasProvisioning =
    chromeInitialized &&
    scalprum.config?.provisioning &&
    (isBeta() || getEnvironment() === 'qa');

  if (!uploadStatus) return null;

  if (
    hasProvisioning &&
    (image.imageType === 'aws' || image.imageType === 'ami')
  ) {
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
