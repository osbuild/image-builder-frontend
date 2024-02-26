import React, { useState } from 'react';

import { FormGroup, Spinner } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { useGetSourceUploadInfoQuery } from '../../../../../store/provisioningApi';
import {
  changeAzureResourceGroup,
  selectAzureResourceGroup,
  selectAzureSource,
} from '../../../../../store/wizardSlice';

export const AzureResourceGroups = () => {
  const azureSource = useAppSelector((state) => selectAzureSource(state));
  const azureResourceGroup = useAppSelector((state) =>
    selectAzureResourceGroup(state)
  );
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const { data: sourceDetails, isFetching } = useGetSourceUploadInfoQuery(
    // @ts-ignore
    { id: azureSource },
    {
      skip: !azureSource,
    }
  );

  const resourceGroups =
    (azureSource && sourceDetails?.azure?.resource_groups) || [];

  const setResourceGroup = (
    _event: React.MouseEvent<Element, MouseEvent>,
    selection: string
  ) => {
    const resource =
      resourceGroups?.find((resource) => resource === selection) || '';
    setIsOpen(false);
    dispatch(changeAzureResourceGroup(resource));
  };

  const handleClear = () => {
    dispatch(changeAzureResourceGroup(''));
  };
  const options: JSX.Element[] = [];

  if (isFetching) {
    options.push(
      <SelectOption
        isNoResultsOption={true}
        data-testid="azure-resource-groups-loading"
      >
        <Spinner size="lg" />
      </SelectOption>
    );
  }

  return (
    <FormGroup
      isRequired
      label={'Resource group'}
      data-testid="azure-resource-groups"
    >
      <Select
        ouiaId="resource_group_select"
        variant={SelectVariant.typeahead}
        onToggle={() => setIsOpen(!isOpen)}
        onSelect={setResourceGroup}
        onClear={handleClear}
        selections={azureResourceGroup}
        isOpen={isOpen}
        placeholderText="Select resource group"
        typeAheadAriaLabel="Select resource group"
      >
        {resourceGroups.map((name: string, index: number) => (
          <SelectOption
            key={index}
            value={name}
            aria-label={`Resource group ${name}`}
          />
        ))}
      </Select>
    </FormGroup>
  );
};
