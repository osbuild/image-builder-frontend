import React from 'react';

import {
  DropdownList,
  DropdownItem,
  MenuToggleAction,
  Spinner,
  Flex,
  FlexItem,
} from '@patternfly/react-core';

import {
  CreateBlueprintRequest,
  useComposeBlueprintMutation,
  useUpdateBlueprintMutation,
} from '../../../../../store/imageBuilderApi';

type EditDropdownProps = {
  getBlueprintPayload: () => Promise<'' | CreateBlueprintRequest | undefined>;
  setIsOpen: (isOpen: boolean) => void;
  blueprintId: string;
};

export const EditSaveAndBuildBtn = ({
  getBlueprintPayload,
  setIsOpen,
  blueprintId,
}: EditDropdownProps) => {
  const [buildBlueprint] = useComposeBlueprintMutation();
  const [updateBlueprint] = useUpdateBlueprintMutation({
    fixedCacheKey: 'updateBlueprintKey',
  });

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
      <DropdownItem onClick={onSaveAndBuild} ouiaId="wizard-edit-build-btn">
        Save and build images
      </DropdownItem>
    </DropdownList>
  );
};

export const EditSaveButton = ({
  setIsOpen,
  getBlueprintPayload,
  blueprintId,
}: EditDropdownProps) => {
  const [updateBlueprint, { isLoading }] = useUpdateBlueprintMutation({
    fixedCacheKey: 'updateBlueprintKey',
  });
  const onSave = async () => {
    const requestBody = await getBlueprintPayload();
    setIsOpen(false);
    requestBody &&
      updateBlueprint({ id: blueprintId, createBlueprintRequest: requestBody });
  };
  return (
    <MenuToggleAction onClick={onSave} id="wizard-edit-save-btn">
      <Flex display={{ default: 'inlineFlex' }}>
        {isLoading && (
          <FlexItem>
            <Spinner
              style={
                { '--pf-v5-c-spinner--Color': '#fff' } as React.CSSProperties
              }
              isInline
              size="md"
            />
          </FlexItem>
        )}
        <FlexItem>Save changes</FlexItem>
      </Flex>
    </MenuToggleAction>
  );
};
