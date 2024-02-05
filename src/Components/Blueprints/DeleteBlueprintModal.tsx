import React from 'react';

import {
  ActionGroup,
  Button,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';

import { useGetBlueprintsQuery } from '../../store/imageBuilderApi';

interface DeleteBlueprintModalProps {
  onDelete: () => Promise<void>;
  selectedBlueprint: string | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteBlueprintModal: React.FunctionComponent<
  DeleteBlueprintModalProps
> = ({
  onDelete,
  selectedBlueprint,
  isOpen,
  onClose,
}: DeleteBlueprintModalProps) => {
  const { blueprintName } = useGetBlueprintsQuery(
    { search: undefined },
    {
      selectFromResult: ({ data }) => ({
        blueprintName: data?.data?.find(
          (blueprint: { id: string | undefined }) =>
            blueprint.id === selectedBlueprint
        )?.name,
      }),
    }
  );
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
