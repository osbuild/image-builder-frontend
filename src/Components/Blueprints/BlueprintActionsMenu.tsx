import React, { useState } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';

import { selectSelectedBlueprintId } from '../../store/BlueprintSlice';
import { useAppSelector } from '../../store/hooks';
import {
  BlueprintResponse,
  useGetBlueprintQuery,
} from '../../store/imageBuilderApi';
import { resolveRelPath } from '../../Utilities/path';
import BetaLabel from '../sharedComponents/BetaLabel';

interface BlueprintActionsMenuProps {
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BlueprintActionsMenu: React.FunctionComponent<
  BlueprintActionsMenuProps
> = ({ setShowDeleteModal }: BlueprintActionsMenuProps) => {
  const [showBlueprintActionsMenu, setShowBlueprintActionsMenu] =
    useState(false);
  const onSelect = () => {
    setShowBlueprintActionsMenu(!showBlueprintActionsMenu);
  };
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const navigate = useNavigate();
  const { data: blueprintDetails } = useGetBlueprintQuery({
    id: selectedBlueprintId || '',
  });
  const blueprintName = blueprintDetails?.name;
  return (
    <Dropdown
      ouiaId={`blueprints-dropdown`}
      isOpen={showBlueprintActionsMenu}
      onSelect={onSelect}
      onOpenChange={(showBlueprintActionsMenu: boolean) =>
        setShowBlueprintActionsMenu(showBlueprintActionsMenu)
      }
      shouldFocusToggleOnSelect
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          isExpanded={showBlueprintActionsMenu}
          onClick={() => setShowBlueprintActionsMenu(!showBlueprintActionsMenu)}
          variant="plain"
          aria-label="blueprint menu toggle"
          isDisabled={selectedBlueprintId === undefined}
        >
          <EllipsisVIcon aria-hidden="true" />
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownItem
          onClick={() =>
            navigate(resolveRelPath(`imagewizard/${selectedBlueprintId}`))
          }
        >
          Edit details
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            if (blueprintName && blueprintDetails) {
              handleExportBlueprint(blueprintName, blueprintDetails);
            }
          }}
        >
          Download blueprint (.json) <BetaLabel />
        </DropdownItem>
        <DropdownItem onClick={() => setShowDeleteModal(true)}>
          Delete blueprint
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

async function handleExportBlueprint(
  blueprintName: string,
  blueprint: BlueprintResponse
) {
  const opts = {
    suggestedName: blueprintName.replace(/\s/g, '_').toLowerCase() + '.json',
    types: [
      {
        description: 'Text file',
        accept: { 'text/plain': ['.json'] },
      },
    ],
  };

  const fileHandle = await (window as any).showSaveFilePicker(opts);
  const writableStream = await fileHandle.createWritable();
  await writableStream.write(JSON.stringify(blueprint, null, 2));
  await writableStream.close();
}
