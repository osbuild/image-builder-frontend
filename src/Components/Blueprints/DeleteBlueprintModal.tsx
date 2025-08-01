import React, { useEffect, useState } from 'react';

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { ChromeUser } from '@redhat-cloud-services/types';

import {
  AMPLITUDE_MODULE_NAME,
  PAGINATION_LIMIT,
  PAGINATION_OFFSET,
} from '../../constants';
import { useDeleteBPWithNotification as useDeleteBlueprintMutation } from '../../Hooks';
import { backendApi, useGetBlueprintsQuery } from '../../store/backendApi';
import {
  selectBlueprintSearchInput,
  selectLimit,
  selectOffset,
  selectSelectedBlueprintId,
  setBlueprintId,
} from '../../store/BlueprintSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { GetBlueprintsApiArg } from '../../store/imageBuilderApi';

interface DeleteBlueprintModalProps {
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}

export const DeleteBlueprintModal: React.FunctionComponent<
  DeleteBlueprintModalProps
> = ({ setShowDeleteModal, isOpen }: DeleteBlueprintModalProps) => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const blueprintSearchInput = useAppSelector(selectBlueprintSearchInput);
  const blueprintsOffset = useAppSelector(selectOffset) || PAGINATION_OFFSET;
  const blueprintsLimit = useAppSelector(selectLimit) || PAGINATION_LIMIT;
  const dispatch = useAppDispatch();
  const { analytics, auth } = useChrome();
  const [userData, setUserData] = useState<ChromeUser | void>(undefined);

  useEffect(() => {
    (async () => {
      const data = await auth.getUser();
      setUserData(data);
    })();
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchParams: GetBlueprintsApiArg = {
    limit: blueprintsLimit,
    offset: blueprintsOffset,
  };

  if (blueprintSearchInput) {
    searchParams.search = blueprintSearchInput;
  }

  const { blueprintName } = useGetBlueprintsQuery(searchParams, {
    selectFromResult: ({ data }) => ({
      blueprintName: data?.data.find(
        (blueprint: { id: string | undefined }) =>
          blueprint.id === selectedBlueprintId
      )?.name,
    }),
  });
  const { trigger: deleteBlueprint } = useDeleteBlueprintMutation({
    fixedCacheKey: 'delete-blueprint',
  });
  const handleDelete = async () => {
    if (selectedBlueprintId) {
      if (!process.env.IS_ON_PREMISE) {
        analytics.track(`${AMPLITUDE_MODULE_NAME} - Blueprint Deleted`, {
          module: AMPLITUDE_MODULE_NAME,
          account_id: userData?.identity.internal?.account_id || 'Not found',
        });
      }
      setShowDeleteModal(false);
      await deleteBlueprint({ id: selectedBlueprintId });
      dispatch(setBlueprintId(undefined));
      dispatch(backendApi.util.invalidateTags([{ type: 'Blueprints' }]));
    }
  };
  const onDeleteClose = () => {
    setShowDeleteModal(false);
  };
  return (
    <Modal variant={ModalVariant.small} isOpen={isOpen} onClose={onDeleteClose}>
      <ModalHeader title={'Delete blueprint?'} titleIconVariant="warning" />
      <ModalBody>
        All versions of {blueprintName} and its associated images will be
        deleted.
      </ModalBody>
      <ModalFooter>
        <Button variant="danger" type="button" onClick={handleDelete}>
          Delete
        </Button>
        <Button variant="link" type="button" onClick={onDeleteClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
