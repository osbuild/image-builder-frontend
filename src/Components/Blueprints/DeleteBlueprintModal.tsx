import React from 'react';

import {
  ActionGroup,
  Button,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';

import {
  selectBlueprintSearchInput,
  selectSelectedBlueprintId,
  setBlueprintId,
} from '../../store/BlueprintSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  useDeleteBlueprintMutation,
  useGetBlueprintsQuery,
} from '../../store/imageBuilderApi';

interface DeleteBlueprintModalProps {
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}

export const DeleteBlueprintModal: React.FunctionComponent<
  DeleteBlueprintModalProps
> = ({ setShowDeleteModal, isOpen }: DeleteBlueprintModalProps) => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const blueprintSearchInput = useAppSelector(selectBlueprintSearchInput);
  const dispatch = useAppDispatch();
  const { blueprintName } = useGetBlueprintsQuery(
    { search: blueprintSearchInput },
    {
      selectFromResult: ({ data }) => ({
        blueprintName: data?.data?.find(
          (blueprint: { id: string | undefined }) =>
            blueprint.id === selectedBlueprintId
        )?.name,
      }),
    }
  );
  const [deleteBlueprint] = useDeleteBlueprintMutation({
    fixedCacheKey: 'delete-blueprint',
  });
  const handleDelete = async () => {
    if (selectedBlueprintId) {
      setShowDeleteModal(false);
      await deleteBlueprint({ id: selectedBlueprintId });
      dispatch(setBlueprintId(undefined));
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
