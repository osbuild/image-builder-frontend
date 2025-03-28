import React from 'react';

import { Button, Modal } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { removeUser, selectUsers } from '../../../../../store/wizardSlice';

type RemoveUserModalProps = {
  setShowRemoveUserModal: React.Dispatch<React.SetStateAction<boolean>>;
  activeTabKey: number;
  setActiveTabKey: React.Dispatch<React.SetStateAction<number>>;
  tabIndex: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  isOpen: boolean;
};

const RemoveUserModal = ({
  setShowRemoveUserModal,
  activeTabKey,
  setActiveTabKey,
  tabIndex,
  setIndex,
  isOpen,
}: RemoveUserModalProps) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);

  const onClose = () => {
    setShowRemoveUserModal(!isOpen);
  };

  const onConfirm = () => {
    const tabIndexNum = tabIndex;
    let nextTabIndex = activeTabKey;

    if (tabIndexNum < activeTabKey) {
      // if a preceding tab is closing, keep focus on the new index of the current tab
      nextTabIndex = activeTabKey - 1 > 0 ? activeTabKey - 1 : 0;
    } else if (activeTabKey === users.length - 1) {
      // if the closing tab is the last tab, focus the preceding tab
      nextTabIndex = users.length - 2 > 0 ? users.length - 2 : 0;
    }

    setActiveTabKey(nextTabIndex);
    setIndex(nextTabIndex);
    dispatch(removeUser(tabIndex));
    setShowRemoveUserModal(!isOpen);
  };

  return (
    <Modal
      title="Remove user?"
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
