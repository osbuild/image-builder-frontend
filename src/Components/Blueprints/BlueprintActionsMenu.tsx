import React, { useState } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { useFlag } from '@unleash/proxy-client-react';
import { useNavigate } from 'react-router-dom';

import { selectSelectedBlueprintId } from '../../store/BlueprintSlice';
import { useAppSelector } from '../../store/hooks';
import { resolveRelPath } from '../../Utilities/path';

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
  const importExportFlag = useFlag('image-builder.import.enabled');

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
          data-testid="blueprint-action-menu-toggle"
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
        {importExportFlag && (
          <DropdownItem>Download blueprint (.json)</DropdownItem>
        )}
        <DropdownItem onClick={() => setShowDeleteModal(true)}>
          Delete blueprint
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};
