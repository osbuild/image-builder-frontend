import React, { FormEvent } from 'react';

import {
  FormGroup,
  FormSelect,
  FormSelectOption,
} from '@patternfly/react-core';

import { ARCHS } from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { ImageRequest } from '../../../../store/imageBuilderApi';
import {
  changeArchitecture,
  selectArchitecture,
} from '../../../../store/wizardSlice';

/**
 * Allows the user to pick the architecture to build
 */
const ArchSelect = () => {
  const architecture = useAppSelector((state) => selectArchitecture(state));
  const dispatch = useAppDispatch();

  const onChange = (
    _event: FormEvent<HTMLSelectElement>,
    value: ImageRequest['architecture']
  ) => {
    dispatch(changeArchitecture(value));
  };

  return (
    <FormGroup
      isRequired={true}
      label="Architecture"
      data-testid="architecture-select"
    >
      <FormSelect
        value={architecture}
        onChange={onChange}
        aria-label="Architecture"
        ouiaId="arch_select"
      >
        {ARCHS.map((arch, index) => (
          <FormSelectOption key={index} value={arch} label={arch} />
        ))}
      </FormSelect>
    </FormGroup>
  );
};

export default ArchSelect;
