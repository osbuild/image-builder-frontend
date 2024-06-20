import React, { useState } from 'react';

import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { FormGroup } from '@patternfly/react-core/dist/dynamic/components/Form';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { useGetSourceListQuery } from '../../../../../store/provisioningApi';
import {
  changeAwsSourceId,
  selectAwsSourceId,
} from '../../../../../store/wizardSlice';

export const AwsSourcesSelect = () => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const sourceId = useAppSelector(selectAwsSourceId);

  const { data, isFetching, isLoading, isSuccess, isError, refetch } =
    useGetSourceListQuery({
      provider: 'aws',
    });

  const sources = data?.data;
  const chosenSource = sources?.find((source) => source.id === sourceId);

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    value: string
  ) => {
    const source = sources?.find((source) => source.name === value);
    dispatch(changeAwsSourceId(source?.id));
    setIsOpen(false);
  };

  const handleClear = () => {
    dispatch(changeAwsSourceId(undefined));
  };

  const handleToggle = () => {
    // Refetch upon opening (but not upon closing)
    if (!isOpen) {
      refetch();
    }

    setIsOpen(!isOpen);
  };

  const selectOptions = sources?.map((source) => (
    <SelectOption key={source.id} value={source.name} />
  ));

  const loadingSpinner = (
    <SelectOption key={'fetching'} isNoResultsOption={true}>
      <Spinner size="lg" />
    </SelectOption>
  );

  if (isFetching) {
    selectOptions?.push(loadingSpinner);
  }

  return (
    <>
      <FormGroup isRequired label={'Source name'} data-testid="sources">
        <Select
          ouiaId="source_select"
          variant={SelectVariant.typeahead}
          onToggle={handleToggle}
          onSelect={handleSelect}
          onClear={handleClear}
          selections={chosenSource?.name}
          isOpen={isOpen}
          placeholderText="Select source"
          typeAheadAriaLabel="Select source"
          isDisabled={!isSuccess || isLoading}
        >
          {selectOptions}
        </Select>
      </FormGroup>
      <>
        {isError && (
          <Alert
            variant={'danger'}
            isPlain={true}
            isInline={true}
            title={'Sources unavailable'}
          >
            Sources cannot be reached, try again later or enter an AWS account
            ID manually.
          </Alert>
        )}
      </>
    </>
  );
};
