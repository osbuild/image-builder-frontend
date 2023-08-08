import React, { useEffect, useState } from 'react';

import { FormSpy } from '@data-driven-forms/react-form-renderer';
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

import { extractProvisioningList } from '../../../store/helpers';
import {
  useGetSourceListQuery,
  useGetSourceUploadInfoQuery,
} from '../../../store/provisioningApi';

export const AWSSourcesSelect = ({
  label,
  isRequired,
  className,
  ...props
}) => {
  const { change, getState } = useFormApi();
  const { input } = useFieldApi(props);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState(
    getState()?.values?.['aws-sources-select']
  );

  const {
    data: rawSources,
    isFetching,
    isSuccess,
    isError,
    refetch,
  } = useGetSourceListQuery({ provider: 'aws' });
  const sources = extractProvisioningList(rawSources);

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
    change('aws-associated-account-id', sourceDetails?.aws?.account_id);
  }, [isFetchingDetails, isSuccessDetails]);

  const onFormChange = ({ values }) => {
    if (
      values['aws-target-type'] !== 'aws-target-type-source' ||
      values[input.name] === undefined
    ) {
      change(input.name, undefined);
      change('aws-associated-account-id', undefined);
    }
  };

  const handleSelect = (_, sourceName) => {
    const sourceId = sources.find((source) => source.name === sourceName).id;
    setSelectedSourceId(sourceId);
    setIsOpen(false);
    change(input.name, sourceId);
  };

  const handleClear = () => {
    setSelectedSourceId();
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
        data-testid="sources"
        className={className}
      >
        <Select
          ouiaId="source_select"
          variant={SelectVariant.typeahead}
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
            isPlain={true}
            isInline={true}
            title={'Sources unavailable'}
          >
            Sources cannot be reached, try again later or enter an AWS account
            ID manually.
          </Alert>
        )}
        {!isError && isErrorDetails && (
          <Alert
            variant={'danger'}
            isPlain
            isInline
            title={'AWS details unavailable'}
          >
            The AWS account ID for the selected source could not be resolved.
            There might be a problem with the source. Verify that the source is
            valid in Sources or select a different source.
          </Alert>
        )}
      </>
    </>
  );
};

AWSSourcesSelect.propTypes = {
  className: PropTypes.string,
  label: PropTypes.node,
  isRequired: PropTypes.bool,
};
