import React, { FormEvent, useContext } from 'react';

import {
  FormGroup,
  FormSelect,
  FormSelectOption,
} from '@patternfly/react-core';

import { ARCHS } from '../../../../constants';
import { ImageWizardContext } from '../../ImageWizardContext';

/**
 * Allows the user to pick the architecture to build
 */
const ArchSelect = () => {
  const { architectureState } = useContext(ImageWizardContext);
  const [arch, setArch] = architectureState;
  const onChange = (_event: FormEvent<HTMLSelectElement>, value: string) => {
    setArch(value);
  };

  return (
    <FormGroup
      isRequired={true}
      label="Architecture"
      data-testid="architecture-select"
    >
      <FormSelect
        value={arch}
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
