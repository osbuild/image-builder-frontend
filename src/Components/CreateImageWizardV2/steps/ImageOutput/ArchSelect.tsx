import React, { useState } from 'react';

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

import { ARCHS } from '../../../constants';

const ArchSelect = ({ label, isRequired, ...props }) => {
  const { change, getState } = useFormApi();
  const { input } = useFieldApi(props);
  const [isOpen, setIsOpen] = useState(false);

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
