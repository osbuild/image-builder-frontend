import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { useAppSelector } from '../../../../../store/hooks';
import {
  addPort,
  removePort,
  selectFirewall,
} from '../../../../../store/wizardSlice';
import ChippingInput from '../../../ChippingInput';
import { useFirewallValidation } from '../../../utilities/useValidation';
import { isPortValid } from '../../../validators';

const PortsInput = () => {
  const ports = useAppSelector(selectFirewall).ports;

  const stepValidation = useFirewallValidation();

  return (
    <FormGroup label="Ports">
      <ChippingInput
        ariaLabel="Add ports"
        placeholder="Add ports"
        validator={isPortValid}
        list={ports}
        item="Port"
        addAction={addPort}
        removeAction={removePort}
        stepValidation={stepValidation}
        fieldName="ports"
      />
    </FormGroup>
  );
};

export default PortsInput;
