import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@patternfly/react-core';
import { useLoadModule, useScalprum } from '@scalprum/react-core';
import ImageLinkDirect from './ImageLinkDirect';

const ImageLink = (props) => {
  const scalprum = useScalprum();
  const hasProvisionig = scalprum.initialized && scalprum.config?.provisioning;
  if (hasProvisionig && props.imageType === 'ami') {
    const [wizardOpen, openWizard] = React.useState(false);
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
              image={{ name: props.imageName, id: props.imageId }}
            />
          )}
        </Suspense>
      );
    }
  }

  return <ImageLinkDirect {...props} />;
};

ImageLink.propTypes = {
  imageId: PropTypes.string.isRequired,
  imageName: PropTypes.string.isRequired,
  imageStatus: PropTypes.object,
  imageType: PropTypes.string,
  uploadOptions: PropTypes.object,
};

export default ImageLink;
