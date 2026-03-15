import React from 'react';

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';

import { useAppDispatch } from '../../../../../store/hooks';
import { removeUser } from '../../../../../store/wizardSlice';

type RemoveUserModalProps = {
  setShowRemoveUserModal: React.Dispatch<React.SetStateAction<boolean>>;
  index: number;
  isOpen: boolean;
  userName: string;
};

const RemoveUserModal = ({
  setShowRemoveUserModal,
  index,
  isOpen,
  userName,
}: RemoveUserModalProps) => {
  const dispatch = useAppDispatch();
  const onClose = () => {
    setShowRemoveUserModal(!isOpen);
  };

  const onConfirm = () => {
    dispatch(removeUser(index));
    setShowRemoveUserModal(!isOpen);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width='50%'>
      <ModalHeader title={`Remove user${userName ? ` ${userName}` : ''}?`} />
      <ModalBody>
        This action is permanent and cannot be undone. Once deleted all
        information about the user will be lost.
      </ModalBody>
      <ModalFooter>
        <Button key='confirm' variant='primary' onClick={onConfirm}>
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
