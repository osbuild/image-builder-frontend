import React from 'react';

import {
  ActionGroup,
  Button,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';

interface DeleteBlueprintModalProps {
  onDelete: () => Promise<void>;
  blueprintName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteBlueprintModal: React.FunctionComponent<
  DeleteBlueprintModalProps
> = ({
  onDelete,
  blueprintName,
  isOpen,
  onClose,
}: DeleteBlueprintModalProps) => {
  return (
    <Modal
      variant={ModalVariant.small}
      titleIconVariant="warning"
      isOpen={isOpen}
      onClose={onClose}
      title={`Permanently delete ${blueprintName}?`}
      description={'All versions will be lost.'}
    >
      <ActionGroup>
        <Button variant="danger" type="button" onClick={onDelete}>
          Delete
        </Button>
        <Button variant="link" type="button" onClick={onClose}>
          Cancel
        </Button>
      </ActionGroup>
    </Modal>
  );
};
