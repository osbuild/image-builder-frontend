import React, { useState } from 'react';

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

import { useGetAWSSourcesQuery } from '../../../store/apiSlice';

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
    data: sources,
    isFetching,
    isSuccess,
    isError,
    refetch,
  } = useGetAWSSourcesQuery();

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
              <SelectOption
                key={source.id}
                value={source.name}
                description={source.account_id}
              />
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
      </>
    </>
  );
};

AWSSourcesSelect.propTypes = {
  className: PropTypes.string,
  label: PropTypes.node,
  isRequired: PropTypes.bool,
};
