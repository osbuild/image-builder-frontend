import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { useAppSelector } from '../../../../../store/hooks';
import {
  addDisabledFirewallService,
  addEnabledFirewallService,
  removeDisabledFirewallService,
  removeEnabledFirewallService,
  selectFirewall,
} from '../../../../../store/wizardSlice';
import LabelInput from '../../../LabelInput';
import { useFirewallValidation } from '../../../utilities/useValidation';
import { isServiceValid } from '../../../validators';

const Services = () => {
  const disabledServices = useAppSelector(selectFirewall).services.disabled;
  const enabledServices = useAppSelector(selectFirewall).services.enabled;

  const stepValidation = useFirewallValidation();

  return (
    <>
      <FormGroup label='Enabled services'>
        <LabelInput
          ariaLabel='Add enabled service'
          placeholder='Enter service name'
          validator={isServiceValid}
          list={enabledServices}
          item='Enabled service'
          addAction={addEnabledFirewallService}
          removeAction={removeEnabledFirewallService}
          stepValidation={stepValidation}
          fieldName='enabledServices'
          hideUtilities
        />
      </FormGroup>
      <FormGroup label='Disabled services'>
        <LabelInput
          ariaLabel='Add disabled service'
          placeholder='Enter service name'
          validator={isServiceValid}
          list={disabledServices}
          item='Disabled service'
          addAction={addDisabledFirewallService}
          removeAction={removeDisabledFirewallService}
          stepValidation={stepValidation}
          fieldName='disabledServices'
          hideUtilities
        />
      </FormGroup>
    </>
  );
};

export default Services;
