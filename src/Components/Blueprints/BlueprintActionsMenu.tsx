import React, { useState } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
} from '@patternfly/react-core';
import { MenuToggleElement } from '@patternfly/react-core/dist/esm/components/MenuToggle/MenuToggle';
import { EllipsisVIcon } from '@patternfly/react-icons';
import TOML from 'smol-toml';

// The exported contents are different between hosted and on prem, so
// abstracting them behind the generic 'backendApi' does not help
// here. This is a symptom of different blueprint formats between hosted
// and on prem, so just import both separately.
import { selectSelectedBlueprintId } from '../../store/BlueprintSlice';
import { useLazyExportBlueprintCockpitQuery } from '../../store/cockpit/cockpitApi';
import type { Blueprint as CloudApiBlueprint } from '../../store/cockpit/composerCloudApi';
import { useAppSelector } from '../../store/hooks';
import {
  BlueprintExportResponse,
  useLazyExportBlueprintQuery,
} from '../../store/imageBuilderApi';

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

  const [trigger] = useLazyExportBlueprintQuery();
  const [cockpitTrigger] = useLazyExportBlueprintCockpitQuery();
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  if (selectedBlueprintId === undefined) {
    return null;
  }
  const handleClick = () => {
    trigger({ id: selectedBlueprintId })
      .unwrap()
      .then((response: BlueprintExportResponse) => {
        handleExportBlueprint(response.name, response);
      });
  };

  const handleCockpitClick = () => {
    cockpitTrigger({ id: selectedBlueprintId })
      .unwrap()
      .then((response: CloudApiBlueprint) => {
        handleExportBlueprint(response.name, response);
      });
  };

  return (
    <Dropdown
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
          variant='plain'
          aria-label='blueprint menu toggle'
        >
          <EllipsisVIcon aria-hidden='true' />
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownItem
          onClick={process.env.IS_ON_PREMISE ? handleCockpitClick : handleClick}
        >
          Download blueprint ({process.env.IS_ON_PREMISE ? '.toml' : '.json'})
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
  blueprint: BlueprintExportResponse | CloudApiBlueprint,
) {
  const data = process.env.IS_ON_PREMISE
    ? TOML.stringify(blueprint)
    : JSON.stringify(blueprint, null, 2);
  const mime = process.env.IS_ON_PREMISE
    ? 'application/octet-stream'
    : 'application/json';
  const blob = new Blob([data], { type: mime });

  const url = URL.createObjectURL(blob);
  // In cockpit we're running in an iframe, the current content-security policy
  // (set in cockpit/public/manifest.json) only allows resources from the same origin as the
  // document (which is unique to the iframe). So create the element in the parent document.
  const link = process.env.IS_ON_PREMISE
    ? window.parent.document.createElement('a')
    : document.createElement('a');
  link.href = url;
  link.download =
    blueprintName.replace(/\s/g, '_').toLowerCase() + process.env.IS_ON_PREMISE
      ? '.toml'
      : '.json';
  link.click();
  URL.revokeObjectURL(url);
}
