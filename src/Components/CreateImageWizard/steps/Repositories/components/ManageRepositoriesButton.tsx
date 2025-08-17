import React, { useState } from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusIcon } from '@patternfly/react-icons';

import ManageRepositoriesModal from './ManageRepositoriesModal';

import { CONTENT_URL } from '../../../../../constants';

const ManageRepositoriesButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (process.env.IS_ON_PREMISE) {
    return (
      <>
        <Button
          variant='link'
          iconPosition='right'
          isInline
          icon={<PlusIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Add custom repository
        </Button>
        <ManageRepositoriesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  return (
    <Button
      component='a'
      target='_blank'
      variant='link'
      iconPosition='right'
      isInline
      icon={<ExternalLinkAltIcon />}
      href={CONTENT_URL}
    >
      Create and manage repositories here
    </Button>
  );
};

export default ManageRepositoriesButton;
