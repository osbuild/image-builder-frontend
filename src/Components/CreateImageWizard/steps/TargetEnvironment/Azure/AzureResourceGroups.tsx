import React, { useEffect, useState } from 'react';

import {
  FormGroup,
  Spinner,
  Select,
  SelectList,
  SelectOption,
  MenuToggleElement,
  MenuToggle,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Button,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { useGetSourceUploadInfoQuery } from '../../../../../store/provisioningApi';
import {
  changeAzureResourceGroup,
  selectAzureResourceGroup,
  selectAzureSource,
} from '../../../../../store/wizardSlice';

const emptyArray: string[] = [];

export const AzureResourceGroups = () => {
  const azureSource = useAppSelector(selectAzureSource);
  const azureResourceGroup = useAppSelector(selectAzureResourceGroup);
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<string[]>([]);

  const {
    data: sourceDetails,
    isFetching,
    isSuccess,
  } = useGetSourceUploadInfoQuery(
    { id: parseInt(azureSource as string) },
    {
      skip: !azureSource,
    }
  );

  // use a static empty array to avoid an infinite render loop in useEffect functions depending
  // on `resourceGroups`
  const resourceGroups = sourceDetails?.azure?.resource_groups || emptyArray;

  useEffect(() => {
    let filteredGroups = resourceGroups;

    if (filterValue) {
      filteredGroups = resourceGroups.filter((group: string) =>
        String(group).toLowerCase().includes(filterValue.toLowerCase())
      );
      if (!isOpen) {
        setIsOpen(true);
      }
    }
    setSelectOptions(filteredGroups);

    // This useEffect hook should run *only* on when the filter value changes.
    // eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue, resourceGroups]);

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!inputValue) {
      setIsOpen(false);
    }
  };

  const onTextInputChange = (_event: React.FormEvent, value: string) => {
    setInputValue(value);
    setFilterValue(value);

    if (value !== azureResourceGroup) {
      dispatch(changeAzureResourceGroup(''));
    }
  };

  const setResourceGroup = (
    _event: React.MouseEvent<Element, MouseEvent>,
    selection: string
  ) => {
    const resource =
      resourceGroups.find((resource) => resource === selection) || '';
    setIsOpen(false);
    dispatch(changeAzureResourceGroup(resource));
  };

  const handleClear = () => {
    dispatch(changeAzureResourceGroup(''));
    setInputValue('');
    setFilterValue('');
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={!azureSource}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={azureResourceGroup ? azureResourceGroup : inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          autoComplete="off"
          placeholder="Select resource group"
          isExpanded={isOpen}
        />

        {azureResourceGroup && (
          <TextInputGroupUtilities>
            <Button
              variant="plain"
              onClick={handleClear}
              aria-label="Clear input"
            >
              <TimesIcon />
            </Button>
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <FormGroup
      isRequired
      label={'Resource group'}
      data-testid="azure-resource-groups"
    >
      <Select
        isScrollable
        isOpen={isOpen}
        selected={azureResourceGroup}
        onSelect={setResourceGroup}
        onOpenChange={() => setIsOpen(!isOpen)}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
        popperProps={{ direction: 'up' }}
      >
        <SelectList>
          {isFetching && (
            <SelectOption
              value="loader"
              data-testid="azure-resource-groups-loading"
            >
              <Spinner size="lg" />
            </SelectOption>
          )}
          {selectOptions.length > 0 &&
            selectOptions.map((name: string, index: number) => (
              <SelectOption
                key={index}
                value={name}
                aria-label={`Resource group ${name}`}
              >
                {name}
              </SelectOption>
            ))}
          {isSuccess && selectOptions.length === 0 && (
            <SelectOption isDisabled>
              {`No results found for "${filterValue}"`}
            </SelectOption>
          )}
        </SelectList>
      </Select>
    </FormGroup>
  );
};
