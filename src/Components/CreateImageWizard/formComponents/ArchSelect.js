import React, { useEffect, useState } from 'react';

import { FormSpy } from '@data-driven-forms/react-form-renderer';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { FormGroup } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';

import { ARCHS, AARCH64 } from '../../../constants';

const ArchSelect = ({ label, isRequired, ...props }) => {
  const { change, getState } = useFormApi();
  const { input } = useFieldApi(props);
  const [isOpen, setIsOpen] = useState(false);

  const [searchParams] = useSearchParams();

  // Set the architecture via search parameter
  // Used by Insights assistant or external hyperlinks (access.redhat.com, developers.redhat.com)
  const preloadArch = searchParams.get('arch');
  useEffect(() => {
    preloadArch === AARCH64 && change(input.name, AARCH64);
  }, [change, input.name, preloadArch]);

  const setArch = (_, selection) => {
    change(input.name, selection);
    setIsOpen(false);
  };

  const setSelectOptions = () => {
    var options = [];
    ARCHS.forEach((arch) => {
      options.push(
        <SelectOption key={arch} value={arch}>
          {arch}
        </SelectOption>
      );
    });

    return options;
  };

  return (
    <FormSpy>
      {() => (
        <FormGroup isRequired={isRequired} label={label}>
          <Select
            ouiaId="arch_select"
            variant={SelectVariant.single}
            onToggle={() => setIsOpen(!isOpen)}
            onSelect={setArch}
            selections={getState()?.values?.[input.name]}
            isOpen={isOpen}
          >
            {setSelectOptions()}
          </Select>
        </FormGroup>
      )}
    </FormSpy>
  );
};

ArchSelect.propTypes = {
  label: PropTypes.node,
  isRequired: PropTypes.bool,
};

export default ArchSelect;
