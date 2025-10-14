import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { useAppSelector } from '../../../../../store/hooks';
import {
  addPort,
  removePort,
  selectFirewall,
} from '../../../../../store/wizardSlice';
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
        placeholder='Enter port (e.g., 8080/tcp, 443:udp)'
        validator={isPortValid}
        list={ports}
        item='Port'
        addAction={addPort}
        removeAction={removePort}
        stepValidation={stepValidation}
        fieldName='ports'
        hideUtilities
      />
    </FormGroup>
  );
};

export default PortsInput;
