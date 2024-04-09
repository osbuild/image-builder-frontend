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
  useCreateBlueprintMutation,
} from '../../../../../store/imageBuilderApi';

type CreateDropdownProps = {
  getBlueprintPayload: () => Promise<'' | CreateBlueprintRequest | undefined>;
  setIsOpen: (isOpen: boolean) => void;
};

export const CreateSaveAndBuildBtn = ({
  getBlueprintPayload,
  setIsOpen,
}: CreateDropdownProps) => {
  const [buildBlueprint] = useComposeBlueprintMutation();
  const [createBlueprint] = useCreateBlueprintMutation({
    fixedCacheKey: 'createBlueprintKey',
  });

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
      <DropdownItem onClick={onSaveAndBuild} ouiaId="wizard-create-build-btn">
        Save changes and build image(s)
      </DropdownItem>
    </DropdownList>
  );
};

export const CreateSaveButton = ({
  setIsOpen,
  getBlueprintPayload,
}: CreateDropdownProps) => {
  const [createBlueprint, { isLoading }] = useCreateBlueprintMutation({
    fixedCacheKey: 'createBlueprintKey',
  });
  const onSave = async () => {
    const requestBody = await getBlueprintPayload();
    setIsOpen(false);
    requestBody && createBlueprint({ createBlueprintRequest: requestBody });
  };
  return (
    <MenuToggleAction onClick={onSave} id="wizard-create-save-btn">
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
