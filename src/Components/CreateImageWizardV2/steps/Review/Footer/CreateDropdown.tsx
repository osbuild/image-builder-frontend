import React from 'react';

import { DropdownList, DropdownItem } from '@patternfly/react-core';

import {
  CreateBlueprintRequest,
  useComposeBlueprintMutation,
  useCreateBlueprintMutation,
} from '../../../../../store/imageBuilderApi';

type CreateDropdownProps = {
  getBlueprintPayload: () => Promise<'' | CreateBlueprintRequest | undefined>;
  setIsOpen: (isOpen: boolean) => void;
};

const CreateDropdown = ({
  getBlueprintPayload,
  setIsOpen,
}: CreateDropdownProps) => {
  const [buildBlueprint] = useComposeBlueprintMutation();
  const [createBlueprint] = useCreateBlueprintMutation({
    fixedCacheKey: 'createBlueprintKey',
  });

  const onSave = async () => {
    const requestBody = await getBlueprintPayload();
    setIsOpen(false);
    requestBody && createBlueprint({ createBlueprintRequest: requestBody });
  };

  const onSaveAndBuild = async () => {
    const requestBody = await getBlueprintPayload();
    setIsOpen(false);
    const blueprint =
      requestBody &&
      (await createBlueprint({
        createBlueprintRequest: requestBody,
      }).unwrap()); // unwrap - access the success payload immediately after a mutation
    blueprint && buildBlueprint({ id: blueprint.id });
  };

  return (
    <DropdownList>
      <DropdownItem onClick={onSave} ouiaId="wizard-create-save-btn">
        Save changes
      </DropdownItem>
      <DropdownItem onClick={onSaveAndBuild} ouiaId="wizard-create-build-btn">
        Save and build images
      </DropdownItem>
    </DropdownList>
  );
};

export default CreateDropdown;
