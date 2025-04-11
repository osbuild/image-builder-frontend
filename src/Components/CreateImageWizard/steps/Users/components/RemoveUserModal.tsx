import React from 'react';

import { Button, Modal } from '@patternfly/react-core';

import calculateNewIndex from './calculateNewIndex';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { removeUser, selectUsers } from '../../../../../store/wizardSlice';

type RemoveUserModalProps = {
  setShowRemoveUserModal: React.Dispatch<React.SetStateAction<boolean>>;
  activeTabKey: number;
  setActiveTabKey: React.Dispatch<React.SetStateAction<number>>;
  tabIndex: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  isOpen: boolean;
  userName: string;
};

const RemoveUserModal = ({
  setShowRemoveUserModal,
  activeTabKey,
  setActiveTabKey,
  tabIndex,
  setIndex,
  isOpen,
  userName,
}: RemoveUserModalProps) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);

  const onClose = () => {
    setShowRemoveUserModal(!isOpen);
  };

  const onConfirm = () => {
    const nextTabIndex = calculateNewIndex(
      tabIndex,
      activeTabKey,
      users.length
    );

    setActiveTabKey(nextTabIndex);
    setIndex(nextTabIndex);
    dispatch(removeUser(tabIndex));
    setShowRemoveUserModal(!isOpen);
  };

  return (
    <Modal
      title={`Remove user${userName ? ` ${userName}` : ''}?`}
      isOpen={isOpen}
      onClose={onClose}
      width="50%"
      actions={[
        <Button key="confirm" variant="primary" onClick={onConfirm}>
          Remove user
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>,
      ]}
      ouiaId="removeUserModal"
    >
      This action is permanent and cannot be undone. Once deleted all
      information about the user will be lost.
    </Modal>
  );
};

export default RemoveUserModal;
