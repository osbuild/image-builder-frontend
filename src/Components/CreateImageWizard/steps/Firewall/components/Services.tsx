import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import ValidatedListInput from '@/Components/CreateImageWizard/ValidatedListInput';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addDisabledFirewallService,
  addEnabledFirewallService,
  removeDisabledFirewallService,
  removeEnabledFirewallService,
  selectFirewall,
  validateFirewallDisabledServices,
  validateFirewallEnabledServices,
} from '@/store/slices/wizard';

const Services = () => {
  const dispatch = useAppDispatch();
  const disabledServices = useAppSelector(selectFirewall).services.disabled;
  const enabledServices = useAppSelector(selectFirewall).services.enabled;

  return (
    <>
      <FormGroup label='Enabled services'>
        <ValidatedListInput
          ariaLabel='Add enabled firewall service'
          placeholder='Enter firewalld service'
          validator={validateFirewallEnabledServices}
          items={enabledServices.map((service) => ({
            value: service,
            required: false,
          }))}
          onAdd={(value) => dispatch(addEnabledFirewallService(value))}
          onRemove={(value) => dispatch(removeEnabledFirewallService(value))}
        />
      </FormGroup>
      <FormGroup label='Disabled services'>
        <ValidatedListInput
          ariaLabel='Add disabled firewall service'
          placeholder='Enter firewalld service'
          validator={validateFirewallDisabledServices}
          items={disabledServices.map((service) => ({
            value: service,
            required: false,
          }))}
          onAdd={(value) => dispatch(addDisabledFirewallService(value))}
          onRemove={(value) => dispatch(removeDisabledFirewallService(value))}
        />
      </FormGroup>
    </>
  );
};

export default Services;
