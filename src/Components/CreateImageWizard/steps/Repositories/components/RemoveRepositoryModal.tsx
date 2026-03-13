import React from 'react';

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeCustomRepositories,
  changePayloadRepositories,
  selectCustomRepositories,
  selectPayloadRepositories,
} from '@/store/slices/wizard';

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
  const customRepositories = useAppSelector(selectCustomRepositories);
  const payloadRepositories = useAppSelector(selectPayloadRepositories);

  const onClose = () => setModalOpen(false);

  const handleRemoveAnyway = () => {
    const itemsToRemove = new Set(reposToRemove);

    dispatch(
      changeCustomRepositories(
        customRepositories.filter(({ id }) => !itemsToRemove.has(id)),
      ),
    );

    dispatch(
      changePayloadRepositories(
        payloadRepositories.filter(({ id }) => !itemsToRemove.has(id || '')),
      ),
    );

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
