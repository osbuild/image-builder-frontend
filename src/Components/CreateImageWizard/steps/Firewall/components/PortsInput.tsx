import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { addPort, removePort, selectFirewall } from '@/store/slices/wizard';

import { useAppSelector } from '../../../../../store/hooks';
import LabelInput from '../../../LabelInput';
import { useFirewallValidation } from '../../../utilities/useValidation';
import { isPortValid } from '../../../validators';

const PortsInput = () => {
  const ports = useAppSelector(selectFirewall).ports;

  const stepValidation = useFirewallValidation();

  return (
    <FormGroup label='Ports'>
      <LabelInput
        ariaLabel='Add ports'
        placeholder='Enter port (e.g., 8080:tcp)'
        validator={isPortValid}
        list={ports}
        item='Port'
        addAction={addPort}
        removeAction={removePort}
        stepValidation={stepValidation}
        fieldName='ports'
      />
    </FormGroup>
  );
};

export default PortsInput;
