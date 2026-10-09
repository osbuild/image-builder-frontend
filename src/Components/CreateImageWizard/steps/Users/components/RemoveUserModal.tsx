import React from 'react';

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';

type RemoveUserModalProps = {
  isOpen: boolean;
  userName: string;
  onRemove: () => void;
  onClose: () => void;
};

const RemoveUserModal = ({
  onRemove,
  onClose,
  isOpen,
  userName,
}: RemoveUserModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} width='50%'>
      <ModalHeader title={`Remove user ${userName}?`} />
      <ModalBody>
        This action is permanent and cannot be undone. Once deleted all
        information about the user will be lost.
      </ModalBody>
      <ModalFooter>
        <Button key='confirm' variant='primary' onClick={onRemove}>
          Remove user
        </Button>
        <Button key='cancel' variant='link' onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RemoveUserModal;
