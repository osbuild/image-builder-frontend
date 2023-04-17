import React, { useState } from 'react';

import { Modal } from '@patternfly/react-core';
import { useNavigate, useParams } from 'react-router-dom';

import RegionsSelect from './RegionsSelect';

import { resolveRelPath } from '../../Utilities/path';

const ShareToRegionsModal = () => {
  const navigate = useNavigate();
  const handleClose = () => navigate(resolveRelPath(''));
  const [isOpen, setIsOpen] = useState(false);

  const { composeId } = useParams();

  const handleToggle = (isOpen) => setIsOpen(isOpen);

  const handleEscapePress = () => {
    if (isOpen) {
      handleToggle(isOpen);
    } else {
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={true}
      variant="small"
      aria-label="Share to new region"
      onClose={handleClose}
      title="Share to new region"
      description="Configure new regions for this image that will run on your AWS. All the
        regions will launch with the same configuration."
      onEscapePress={handleEscapePress}
    >
      <RegionsSelect
        composeId={composeId}
        handleClose={handleClose}
        handleToggle={handleToggle}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </Modal>
  );
};

export default ShareToRegionsModal;
