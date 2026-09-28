import React from 'react';

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';

import { useAppDispatch } from '@/store/hooks';
import { removeRepositoriesById } from '@/store/slices/wizard';

type RemoveRepositoryModalProps = {
  modalOpen: boolean;
  setModalOpen: (value: boolean) => void;
  reposToRemove: string[];
  setReposToRemove: (value: string[]) => void;
};

const RemoveRepositoryModal = ({
  modalOpen,
  setModalOpen,
  reposToRemove,
  setReposToRemove,
}: RemoveRepositoryModalProps) => {
  const dispatch = useAppDispatch();

  const onClose = () => setModalOpen(false);

  const handleRemoveAnyway = () => {
    dispatch(removeRepositoriesById(reposToRemove));
    setReposToRemove([]);
    onClose();
  };

  return (
    <Modal isOpen={modalOpen} onClose={onClose} variant='small'>
      <ModalHeader title='Are you sure?' titleIconVariant='warning' />
      <ModalBody>
        You are removing a previously added repository.
        <br />
        We do not recommend removing repositories if you have added packages
        from them.
      </ModalBody>
      <ModalFooter>
        <Button key='remove' variant='primary' onClick={handleRemoveAnyway}>
          Remove anyway
        </Button>
        <Button key='back' variant='link' onClick={onClose}>
          Back
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RemoveRepositoryModal;
