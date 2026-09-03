import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import ValidatedListInput from '@/Components/CreateImageWizard/ValidatedListInput';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addPort,
  removePort,
  selectFirewall,
  validateFirewallPorts,
} from '@/store/slices/wizard';

const PortsInput = () => {
  const dispatch = useAppDispatch();
  const ports = useAppSelector(selectFirewall).ports;

  return (
    <FormGroup label='Ports'>
      <ValidatedListInput
        ariaLabel='Add ports'
        placeholder='Enter port'
        validator={validateFirewallPorts}
        items={ports.map((port) => ({ value: port, required: false }))}
        onAdd={(value) => dispatch(addPort(value))}
        onRemove={(value) => dispatch(removePort(value))}
        helperText='Examples: 8080:tcp, 443:udp.'
      />
    </FormGroup>
  );
};

export default PortsInput;
