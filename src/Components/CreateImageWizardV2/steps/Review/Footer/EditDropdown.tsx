import React from 'react';

import { DropdownList, DropdownItem } from '@patternfly/react-core';

import {
  CreateBlueprintRequest,
  useComposeBlueprintMutation,
  useUpdateBlueprintMutation,
} from '../../../../../store/imageBuilderApi';

type CreateDropdownProps = {
  getBlueprintPayload: () => Promise<'' | CreateBlueprintRequest | undefined>;
  setIsOpen: (isOpen: boolean) => void;
  blueprintId: string;
};

const EditDropdown = ({
  getBlueprintPayload,
  setIsOpen,
  blueprintId,
}: CreateDropdownProps) => {
  const [buildBlueprint] = useComposeBlueprintMutation();
  const [updateBlueprint] = useUpdateBlueprintMutation({
    fixedCacheKey: 'updateBlueprintKey',
  });

  const onSave = async () => {
    const requestBody = await getBlueprintPayload();
    setIsOpen(false);
    requestBody &&
      updateBlueprint({ id: blueprintId, createBlueprintRequest: requestBody });
  };

  const onSaveAndBuild = async () => {
    const requestBody = await getBlueprintPayload();
    setIsOpen(false);
    requestBody &&
      (await updateBlueprint({
        id: blueprintId,
        createBlueprintRequest: requestBody,
      }));
    buildBlueprint({ id: blueprintId });
  };

  return (
    <DropdownList>
      <DropdownItem onClick={onSave} ouiaId="wizard-edit-save-btn">
        Save changes
      </DropdownItem>
      <DropdownItem onClick={onSaveAndBuild} ouiaId="wizard-edit-build-btn">
        Save and build images
      </DropdownItem>
    </DropdownList>
  );
};

export default EditDropdown;
