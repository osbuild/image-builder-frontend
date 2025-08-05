import React from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
} from '@patternfly/react-core';
import { MenuToggleElement } from '@patternfly/react-core/dist/esm/components/MenuToggle/MenuToggle';
import { FilterIcon } from '@patternfly/react-icons';

import {
  selectBlueprintVersionFilter,
  setBlueprintVersionFilter,
  versionFilterType,
} from '../../store/BlueprintSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

interface blueprintVersionFilterProps {
  onFilterChange?: () => void;
}

const BlueprintVersionFilter: React.FC<blueprintVersionFilterProps> = ({
  onFilterChange,
}: blueprintVersionFilterProps) => {
  const dispatch = useAppDispatch();
  const blueprintVersionFilter = useAppSelector(selectBlueprintVersionFilter);
  const [isOpen, setIsOpen] = React.useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: versionFilterType,
  ) => {
    dispatch(setBlueprintVersionFilter(value));
    if (onFilterChange) onFilterChange();
    setIsOpen(false);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={onSelect}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={onToggleClick}
          isExpanded={isOpen}
          icon={<FilterIcon />}
        >
          {blueprintVersionFilter === 'latest' ? 'Newest' : 'All versions'}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
    >
      <DropdownList>
        <DropdownItem value={'all'} key='all'>
          All versions
        </DropdownItem>
        <DropdownItem value={'latest'} key='newest'>
          Newest
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default BlueprintVersionFilter;
