import React, { useState } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleCheckbox,
  MenuToggleElement,
} from '@patternfly/react-core';

import { ApiRepositoryResponseRead } from '../../../../../store/contentSourcesApi';

interface BulkSelectProps {
  selected: Set<string>;
  contentList: ApiRepositoryResponseRead[];
  deselectAll: () => void;
  perPage: number;
  handleAddRemove: (
    repo: ApiRepositoryResponseRead | ApiRepositoryResponseRead[],
    selected: boolean
  ) => void;
  isDisabled: boolean;
}

export function BulkSelect({
  selected,
  contentList,
  deselectAll,
  perPage,
  handleAddRemove,
  isDisabled,
}: BulkSelectProps) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);

  const allChecked = !contentList.some(({ uuid }) => !selected.has(uuid!));

  const someChecked =
    allChecked || contentList.some(({ uuid }) => selected.has(uuid!));

  const toggleDropdown = () => setDropdownIsOpen(!dropdownIsOpen);

  const handleSelectPage = () => handleAddRemove(contentList, !allChecked);

  return (
    <Dropdown
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          id="bulk-select-toggle"
          data-testid="bulk-select-toggle"
          ref={toggleRef}
          isDisabled={isDisabled}
          splitButtonOptions={{
            items: [
              <MenuToggleCheckbox
                id="bulk-select-checkbox"
                key="split-checkbox"
                aria-label="Select all"
                isChecked={allChecked || someChecked ? null : false}
                onClick={handleSelectPage}
              />,
            ],
          }}
          onClick={toggleDropdown}
        >
          {someChecked ? `${selected.size} selected` : null}
        </MenuToggle>
      )}
      isOpen={dropdownIsOpen}
    >
      <DropdownList>
        <DropdownItem
          key="none"
          isDisabled={!selected.size}
          onClick={() => {
            deselectAll();
            toggleDropdown();
          }}
        >{`Clear all (${selected.size} items)`}</DropdownItem>
        <DropdownItem
          key="page"
          isDisabled={!contentList.length}
          onClick={() => {
            handleSelectPage();
            toggleDropdown();
          }}
        >{`${allChecked ? 'Remove' : 'Select'} page (${
          perPage > contentList.length ? contentList.length : perPage
        } items)`}</DropdownItem>
      </DropdownList>
    </Dropdown>
  );
}
