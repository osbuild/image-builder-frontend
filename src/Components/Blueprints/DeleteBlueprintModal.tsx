import React from 'react';

import {
  ActionGroup,
  Button,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';

import {
  useDeleteBlueprintMutation,
  useGetBlueprintsQuery,
} from '../../store/imageBuilderApi';

interface DeleteBlueprintModalProps {
  selectedBlueprint: string | undefined;
  setSelectedBlueprint: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}

export const DeleteBlueprintModal: React.FunctionComponent<
  DeleteBlueprintModalProps
> = ({
  selectedBlueprint,
  setSelectedBlueprint,
  setShowDeleteModal,
  isOpen,
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
  const [deleteBlueprint] = useDeleteBlueprintMutation({
    fixedCacheKey: 'delete-blueprint',
  });
  const handleDelete = async () => {
    if (selectedBlueprint) {
      setShowDeleteModal(false);
      await deleteBlueprint({ id: selectedBlueprint });
      setSelectedBlueprint(undefined);
    }
  };
  const onDeleteClose = () => {
    setShowDeleteModal(false);
  };
  return (
    <Modal
      variant={ModalVariant.small}
      titleIconVariant="warning"
      isOpen={isOpen}
      onClose={onDeleteClose}
      title={`Permanently delete ${blueprintName}?`}
      description={'All versions will be lost.'}
    >
      <ActionGroup>
        <Button variant="danger" type="button" onClick={handleDelete}>
          Delete
        </Button>
        <Button variant="link" type="button" onClick={onDeleteClose}>
          Cancel
        </Button>
      </ActionGroup>
    </Modal>
  );
};
