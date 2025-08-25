import React, { useEffect, useState } from 'react';

import {
  Alert,
  Button,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  useGetSourceListQuery,
  useGetSourceUploadInfoQuery,
} from '../../../../../store/provisioningApi';
import {
  changeAzureResourceGroup,
  changeAzureSource,
  changeAzureSubscriptionId,
  changeAzureTenantId,
  selectAzureSource,
} from '../../../../../store/wizardSlice';

export const AzureSourcesSelect = () => {
  const azureSource = useAppSelector(selectAzureSource);
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');

  const {
    data: rawSources,
    isFetching,
    isSuccess,
    isError,
    refetch,
  } = useGetSourceListQuery({ provider: 'azure' });

  const {
    data: sourceDetails,
    isFetching: isFetchingDetails,
    isSuccess: isSuccessDetails,
    isError: isErrorDetails,
  } = useGetSourceUploadInfoQuery(
    { id: parseInt(azureSource as string) },
    {
      skip: !azureSource,
    },
  );

  const [selectOptions, setSelectOptions] = useState<(string | undefined)[]>(
    rawSources?.data?.map((source) => source?.name) || [],
  );

  useEffect(() => {
    if (isFetchingDetails || !isSuccessDetails || !azureSource) return;
    dispatch(changeAzureTenantId(sourceDetails?.azure?.tenant_id || ''));
    dispatch(
      changeAzureSubscriptionId(sourceDetails?.azure?.subscription_id || ''),
    );
  }, [
    azureSource,
    isFetchingDetails,
    isSuccessDetails,
    sourceDetails?.azure?.tenant_id,
    sourceDetails?.azure?.subscription_id,
    dispatch,
  ]);

  useEffect(() => {
    let filteredSources = rawSources?.data?.map((source) => source?.name);

    if (filterValue) {
      filteredSources = rawSources?.data
        ?.map((source) => source?.name)
        .filter((source: string) =>
          String(source).toLowerCase().includes(filterValue.toLowerCase()),
        );
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    if (filteredSources) {
      setSelectOptions(filteredSources);
    }

    // This useEffect hook should run *only* on when the filter value changes.
    // eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue, rawSources?.data]);

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

    if (value !== selectedSource) {
      dispatch(changeAzureSource(''));
    }
  };

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    sourceName: string,
  ) => {
    const sourceId = rawSources?.data?.find(
      (source) => source?.name === sourceName,
    )?.id;
    dispatch(changeAzureSource(sourceId || ''));
    dispatch(changeAzureResourceGroup(''));
    setIsOpen(false);
  };

  const handleClear = () => {
    dispatch(changeAzureSource(''));
    dispatch(changeAzureTenantId(''));
    dispatch(changeAzureSubscriptionId(''));
    dispatch(changeAzureResourceGroup(''));
    setInputValue('');
    setFilterValue('');
  };

  const handleToggle = () => {
    // Refetch upon opening (but not upon closing)
    if (!isOpen) {
      refetch();
    }

    setIsOpen(!isOpen);
  };

  const selectedSource = azureSource
    ? rawSources?.data?.find((source) => source?.id === azureSource)?.name
    : undefined;

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant='typeahead'
      onClick={handleToggle}
      isExpanded={isOpen}
      isDisabled={!isSuccess}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={selectedSource ? selectedSource : inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          autoComplete='off'
          placeholder='Select source'
          isExpanded={isOpen}
        />

        {selectedSource && (
          <TextInputGroupUtilities>
            <Button
              icon={<TimesIcon />}
              variant='plain'
              onClick={handleClear}
              aria-label='Clear input'
            />
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <>
      <FormGroup isRequired label={'Source name'}>
        <Select
          isScrollable
          isOpen={isOpen}
          selected={selectedSource}
          onSelect={handleSelect}
          onOpenChange={handleToggle}
          toggle={toggle}
          shouldFocusFirstItemOnOpen={false}
        >
          <SelectList>
            {isFetching && (
              <SelectOption key='loading' value='loader'>
                <Spinner size='lg' />
              </SelectOption>
            )}
            {selectOptions.length > 0 &&
              selectOptions.map((source, index) => (
                <SelectOption key={index} value={source}>
                  {source}
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
      {isError && (
        <Alert
          variant={'danger'}
          isPlain
          isInline
          title={'Sources unavailable'}
        >
          Sources cannot be reached, try again later or enter an account info
          for upload manually.
        </Alert>
      )}
      {!isError && isErrorDetails && (
        <Alert
          variant={'danger'}
          isPlain
          isInline
          title={'Azure details unavailable'}
        >
          Could not fetch Tenant ID and Subscription ID from Azure for given
          Source. Check Sources page for the source availability or select a
          different Source.
        </Alert>
      )}
      <></>
    </>
  );
};
