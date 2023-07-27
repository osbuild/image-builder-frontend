import React, { useState } from 'react';

import FormSpy from '@data-driven-forms/react-form-renderer/form-spy';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  Spinner,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';

import { useGetSourceUploadInfoQuery } from '../../../store/provisioningApi';

const AzureResourceGroups = ({ label, isRequired, className, ...props }) => {
  const { change, getState } = useFormApi();
  const { input } = useFieldApi(props);
  const [isOpen, setIsOpen] = useState(false);
  const [sourceId, setSourceId] = useState(
    getState()?.values?.['azure-sources-select']
  );
  const onFormChange = ({ values }) => {
    setSourceId(values['azure-sources-select']);
  };

  const { data: sourceDetails, isFetching } = useGetSourceUploadInfoQuery(
    { id: sourceId },
    {
      skip: !sourceId,
    }
  );
  const resourceGroups =
    (sourceId && sourceDetails?.azure?.resource_groups) || [];

  const setResourceGroup = (_, selection) => {
    setIsOpen(false);
    change(input.name, selection);
  };

  const handleClear = () => {
    change(input.name, undefined);
  };

  return (
    <FormGroup
      isRequired={isRequired}
      label={label}
      data-testid="azure-resource-groups"
    >
      <FormSpy subscription={{ values: true }} onChange={onFormChange} />
      <Select
        ouiaId="resource_group_select"
        variant={SelectVariant.typeahead}
        className={className}
        onToggle={() => setIsOpen(!isOpen)}
        onSelect={setResourceGroup}
        onClear={handleClear}
        selections={input.value}
        isOpen={isOpen}
        placeholderText="Select resource group"
        typeAheadAriaLabel="Select resource group"
      >
        {isFetching && (
          <SelectOption
            isNoResultsOption={true}
            data-testid="azure-resource-groups-loading"
          >
            <Spinner isSVG size="lg" />
          </SelectOption>
        )}
        {resourceGroups.map((name, index) => (
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

AzureResourceGroups.propTypes = {
  label: PropTypes.node,
  isRequired: PropTypes.bool,
  className: PropTypes.string,
};

AzureResourceGroups.defaultProps = {
  label: '',
  isRequired: false,
  className: '',
};

export default AzureResourceGroups;
