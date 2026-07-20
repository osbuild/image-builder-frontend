import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import LabelInput from '@/Components/CreateImageWizard/LabelInput';
import { useFirewallValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { isPortValid } from '@/Components/CreateImageWizard/validators';
import { useAppSelector } from '@/store/hooks';
import { addPort, removePort, selectFirewall } from '@/store/slices/wizard';

const PortsInput = () => {
  const ports = useAppSelector(selectFirewall).ports;

  const stepValidation = useFirewallValidation();

  return (
    <FormGroup label='Ports'>
      <LabelInput
        ariaLabel='Add ports'
        placeholder='Enter port'
        validator={isPortValid}
        list={ports}
        item='Port'
        addAction={addPort}
        removeAction={removePort}
        stepValidation={stepValidation}
        fieldName='ports'
        helperText='Examples: 8080:tcp, 443:udp.'
      />
    </FormGroup>
  );
};

export default PortsInput;
