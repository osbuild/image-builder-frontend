import React, { useMemo } from 'react';

import { Modal, ModalBody, ModalHeader } from '@patternfly/react-core';
import { useNavigate, useParams } from 'react-router-dom';

import RegionsSelect from './RegionsSelect';

import { MODAL_ANCHOR } from '../../constants';
import { resolveRelPath } from '../../Utilities/path';

const ShareToRegionsModal = () => {
  const navigate = useNavigate();
  const handleClose = () => navigate(resolveRelPath(''));

  const { composeId } = useParams();

  const appendTo = useMemo(() => {
    const modalAnchor = document.querySelector(MODAL_ANCHOR);
    return modalAnchor === null ? undefined : (modalAnchor as HTMLElement);
  }, []);

  if (!composeId) {
    handleClose();
    return undefined;
  }

  return (
    <Modal
      isOpen={true}
      variant='small'
      aria-label='Share to new region'
      onClose={handleClose}
      appendTo={appendTo}
    >
      <ModalHeader
        title='Share to new region'
        description='Configure new regions for this image that will run on your AWS. All the
        regions will launch with the same configuration.'
      />
      <ModalBody>
        <RegionsSelect composeId={composeId} handleClose={handleClose} />
      </ModalBody>
    </Modal>
  );
};

export default ShareToRegionsModal;
