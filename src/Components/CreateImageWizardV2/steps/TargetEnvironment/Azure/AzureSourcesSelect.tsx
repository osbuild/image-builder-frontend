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
<<<<<<< HEAD
=======
  let tenantId = useAppSelector((state) => selectAzureTenantId(state));
  let subscriptionId = useAppSelector((state) =>
    selectAzureSubscriptionId(state)
  );
>>>>>>> 04343f8 (add some changes when user choose to fill source)
  const azureSource = useAppSelector((state) => selectAzureSource(state));
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
  tenantId = sourceDetails?.azure?.tenant_id || '';
  subscriptionId = sourceDetails?.azure?.subscription_id || '';

  useEffect(() => {
    if (isFetchingDetails || !isSuccessDetails) return;
<<<<<<< HEAD
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
=======
    dispatch(changeAzureTenantId(tenantId));
    dispatch(changeAzureSubscriptionId(subscriptionId));
  }, [isFetchingDetails, isSuccessDetails, tenantId, subscriptionId, dispatch]);
>>>>>>> 04343f8 (add some changes when user choose to fill source)

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    sourceName: string
  ) => {
    const sourceId = rawSources?.data?.find(
      (source) => source?.name === sourceName
    )?.id;
<<<<<<< HEAD
    dispatch(changeAzureSource(sourceId || ''));
=======
    dispatch(changeAzureSource(sourceId));
>>>>>>> 04343f8 (add some changes when user choose to fill source)
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
<<<<<<< HEAD
=======

>>>>>>> 04343f8 (add some changes when user choose to fill source)
  const selectOptions = rawSources?.data?.map((source) => (
    <SelectOption key={source.id} value={source.name} />
  ));

  if (isSuccess) {
<<<<<<< HEAD
=======
    rawSources?.data?.map((source) => (
      <SelectOption key={source.id} value={source.name} />
    ));
>>>>>>> 04343f8 (add some changes when user choose to fill source)
    if (isFetching) {
      selectOptions?.push(
        <SelectOption key="loading" isNoResultsOption={true}>
          <Spinner size="lg" />
        </SelectOption>
      );
    }
<<<<<<< HEAD
=======

    return (
      <>
        <FormGroup isRequired label={'Source Name'} data-testid="azure-sources">
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
        <>
          {isError && (
            <Alert
              variant={'danger'}
              isPlain
              isInline
              title={'Sources unavailable'}
            >
              Sources cannot be reached, try again later or enter an account
              info for upload manually.
            </Alert>
          )}
          {!isError && isErrorDetails && (
            <Alert
              variant={'danger'}
              isPlain
              isInline
              title={'Azure details unavailable'}
            >
              Could not fetch Tenant id and Subscription id from Azure for given
              Source. Check Sources page for the source availability or select a
              different Source.
            </Alert>
          )}
        </>
      </>
    );
>>>>>>> 04343f8 (add some changes when user choose to fill source)
  }

  return (
    <>
      <FormGroup isRequired label={'Source Name'} data-testid="azure-sources">
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
          Could not fetch Tenant id and Subscription id from Azure for given
          Source. Check Sources page for the source availability or select a
          different Source.
        </Alert>
      )}
      <></>
    </>
  );
};
