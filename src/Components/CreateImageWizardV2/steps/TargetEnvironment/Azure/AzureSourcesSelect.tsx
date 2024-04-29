import React, { useState, useEffect } from 'react';

import { Alert } from '@patternfly/react-core';
import { FormGroup, Spinner } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';

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
    }
  );

  useEffect(() => {
    if (isFetchingDetails || !isSuccessDetails) return;
    dispatch(changeAzureTenantId(sourceDetails?.azure?.tenant_id || ''));
    dispatch(
      changeAzureSubscriptionId(sourceDetails?.azure?.subscription_id || '')
    );
  }, [
    isFetchingDetails,
    isSuccessDetails,
    sourceDetails?.azure?.tenant_id,
    sourceDetails?.azure?.subscription_id,
    dispatch,
  ]);

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    sourceName: string
  ) => {
    const sourceId = rawSources?.data?.find(
      (source) => source?.name === sourceName
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
  };

  const handleToggle = () => {
    // Refetch upon opening (but not upon closing)
    if (!isOpen) {
      refetch();
    }

    setIsOpen(!isOpen);
  };
  const selectOptions = rawSources?.data?.map((source) => (
    <SelectOption key={source.id} value={source.name} />
  ));

  if (isSuccess) {
    if (isFetching) {
      selectOptions?.push(
        <SelectOption key="loading" isNoResultsOption={true}>
          <Spinner size="lg" />
        </SelectOption>
      );
    }
  }

  return (
    <>
      <FormGroup isRequired label={'Source name'} data-testid="azure-sources">
        <Select
          ouiaId="source_select"
          variant={SelectVariant.typeahead}
          onToggle={handleToggle}
          onSelect={handleSelect}
          onClear={handleClear}
          selections={
            azureSource
              ? rawSources?.data?.find((source) => source.id === azureSource)
                  ?.name
              : undefined
          }
          isOpen={isOpen}
          placeholderText="Select source"
          typeAheadAriaLabel="Select source"
          menuAppendTo="parent"
          maxHeight="25rem"
          isDisabled={!isSuccess}
        >
          {selectOptions}
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
