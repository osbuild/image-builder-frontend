import React from 'react';
import PropTypes from 'prop-types';
import { Button, Spinner } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ImageLinkDirect from './ImageLinkDirect';

const ImageLink = ({
  imageId,
  imageName,
  imageType,
  imageStatus,
  ...props
}) => {
  const [wizardOpen, openWizard] = React.useState(false);
  const uploadStatus = imageStatus?.upload_status;

  if (!uploadStatus) return null;

  if (imageType === 'ami') {
    return (
      <>
        <Button variant="link" isInline onClick={() => openWizard(true)}>
          Launch
        </Button>
        <AsyncComponent
          isOpen={wizardOpen}
          onClose={() => openWizard(false)}
          image={{ name: imageName, id: imageId }}
          appName="provisioning"
          module="./ProvisioningWizard"
          fallback={<Spinner size="sm" isSVG />}
        />
      </>
    );
  }

  return (
    <ImageLinkDirect
      imageType={imageType}
      uploadStatus={uploadStatus}
      {...props}
    />
  );
};

ImageLink.propTypes = {
  imageId: PropTypes.string.isRequired,
  imageName: PropTypes.string.isRequired,
  imageStatus: PropTypes.object,
  imageType: PropTypes.string,
  uploadOptions: PropTypes.object,
  isExpired: PropTypes.bool,
  recreateImage: PropTypes.object,
};

export default ImageLink;
