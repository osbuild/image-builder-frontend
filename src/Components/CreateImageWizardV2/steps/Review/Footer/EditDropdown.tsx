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
  isDisabled?: boolean;
};

export const EditSaveAndBuildBtn = ({
  getBlueprintPayload,
  setIsOpen,
  blueprintId,
  isDisabled,
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
    buildBlueprint({ id: blueprintId, body: {} });
  };

  return (
    <DropdownList>
      <DropdownItem
        onClick={onSaveAndBuild}
        ouiaId="wizard-edit-build-btn"
        isDisabled={isDisabled}
      >
        Save changes and build image(s)
      </DropdownItem>
    </DropdownList>
  );
};

export const EditSaveButton = ({
  setIsOpen,
  getBlueprintPayload,
  blueprintId,
  isDisabled,
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
    <MenuToggleAction
      onClick={onSave}
      id="wizard-edit-save-btn"
      isDisabled={isDisabled}
    >
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
        <FlexItem>Save changes to blueprint</FlexItem>
      </Flex>
    </MenuToggleAction>
  );
};
