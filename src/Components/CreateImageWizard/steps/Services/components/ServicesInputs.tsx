import React, { useMemo } from 'react';

import { FormGroup } from '@patternfly/react-core';

import TextInputGroup from '@/Components/CreateImageWizard/TextInputGroup';
import { useSecuritySummary } from '@/store/api/backend';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addDisabledService,
  addEnabledService,
  addMaskedService,
  removeDisabledService,
  removeEnabledService,
  removeMaskedService,
  selectServices,
  validateDisabledServices,
  validateEnabledServices,
  validateMaskedServices,
} from '@/store/slices/wizard';
import { mergeListItems } from '@/Utilities/mergeListItems';

const ServicesInput = () => {
  const dispatch = useAppDispatch();
  const disabledServices = useAppSelector(selectServices).disabled;
  const maskedServices = useAppSelector(selectServices).masked;
  const enabledServices = useAppSelector(selectServices).enabled;

  const { services: oscapServices } = useSecuritySummary();

  const { enabled, disabled, masked } = useMemo(
    () => ({
      enabled: mergeListItems(oscapServices.enabled, enabledServices),
      disabled: mergeListItems(oscapServices.disabled, disabledServices),
      masked: mergeListItems(oscapServices.masked, maskedServices),
    }),
    [enabledServices, disabledServices, maskedServices, oscapServices],
  );

  return (
    <>
      <FormGroup isRequired={false} label='Enabled services'>
        <TextInputGroup
          ariaLabel='Add enabled systemd service'
          placeholder='Add enabled service'
          validator={validateEnabledServices}
          items={enabled}
          onAdd={(value) => dispatch(addEnabledService(value))}
          onRemove={(value) => dispatch(removeEnabledService(value))}
          helperText='These services are currently active and set to start automatically at boot.'
        />
      </FormGroup>
      <FormGroup isRequired={false} label='Disabled services'>
        <TextInputGroup
          ariaLabel='Add disabled systemd service'
          placeholder='Add disabled service'
          validator={validateDisabledServices}
          items={disabled}
          onAdd={(value) => dispatch(addDisabledService(value))}
          onRemove={(value) => dispatch(removeDisabledService(value))}
          helperText='These services are installed but will not start automatically at boot.'
        />
      </FormGroup>
      <FormGroup isRequired={false} label='Masked services'>
        <TextInputGroup
          ariaLabel='Add masked systemd service'
          placeholder='Add masked service'
          validator={validateMaskedServices}
          items={masked}
          onAdd={(value) => dispatch(addMaskedService(value))}
          onRemove={(value) => dispatch(removeMaskedService(value))}
          helperText='These services are completely blocked from being started manually or automatically.'
        />
      </FormGroup>
    </>
  );
};

export default ServicesInput;
