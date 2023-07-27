import React, { useState, useEffect } from 'react';

import FormSpy from '@data-driven-forms/react-form-renderer/form-spy';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { Alert } from '@patternfly/react-core';
import {
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  Spinner,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';

import {
  useGetSourceListQuery,
  useGetSourceUploadInfoQuery,
} from '../../../store/provisioningApi';

const AzureSourcesSelect = ({ label, isRequired, className, ...props }) => {
  const { change } = useFormApi();
  const { input } = useFieldApi(props);
  const [isOpen, setIsOpen] = useState(false);
  const selectedSourceId = input.value;

  const {
    data: sources,
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
    { id: selectedSourceId },
    {
      skip: !selectedSourceId,
    }
  );

  useEffect(() => {
    if (isFetchingDetails || !isSuccessDetails) return;
    change('azure-tenant-id', sourceDetails?.azure?.tenant_id);
    change('azure-subscription-id', sourceDetails?.azure?.subscription_id);
  }, [isFetchingDetails, isSuccessDetails]);

  const onFormChange = ({ values }) => {
    if (
      values['azure-type'] !== 'azure-type-source' ||
      values[input.name] === undefined
    ) {
      change(input.name, undefined);
      change('azure-tenant-id', undefined);
      change('azure-subscription-id', undefined);
    }
  };

  const handleSelect = (_, sourceName) => {
    const sourceId = sources.find((source) => source.name === sourceName).id;
    change(input.name, sourceId);
    setIsOpen(false);
  };

  const handleClear = () => {
    change(input.name, undefined);
  };

  const handleToggle = () => {
    // Refetch upon opening (but not upon closing)
    if (!isOpen) {
      refetch();
    }

    setIsOpen(!isOpen);
  };

  return (
    <>
      <FormSpy subscription={{ values: true }} onChange={onFormChange} />
      <FormGroup
        isRequired={isRequired}
        label={label}
        data-testid="azure-sources"
      >
        <Select
          ouiaId="source_select"
          variant={SelectVariant.typeahead}
          className={className}
          onToggle={handleToggle}
          onSelect={handleSelect}
          onClear={handleClear}
          selections={
            selectedSourceId
              ? sources.find((source) => source.id === selectedSourceId)?.name
              : undefined
          }
          isOpen={isOpen}
          placeholderText="Select source"
          typeAheadAriaLabel="Select source"
          menuAppendTo="parent"
          maxHeight="25rem"
          isDisabled={!isSuccess}
        >
          {isSuccess &&
            sources.map((source) => (
              <SelectOption key={source.id} value={source.name} />
            ))}
          {isFetching && (
            <SelectOption isNoResultsOption={true}>
              <Spinner isSVG size="lg" />
            </SelectOption>
          )}
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
      </>
    </>
  );
};

AzureSourcesSelect.propTypes = {
  className: PropTypes.string,
  label: PropTypes.node,
  isRequired: PropTypes.bool,
};

export default AzureSourcesSelect;
