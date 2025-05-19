import React, { useMemo } from 'react';

import { Modal } from '@patternfly/react-core/deprecated';
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
      variant="small"
      aria-label="Share to new region"
      onClose={handleClose}
      title="Share to new region"
      description="Configure new regions for this image that will run on your AWS. All the
        regions will launch with the same configuration."
      appendTo={appendTo}
    >
      <RegionsSelect composeId={composeId} handleClose={handleClose} />
    </Modal>
  );
};

export default ShareToRegionsModal;
