import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import LabelInput from '@/Components/CreateImageWizard/LabelInput';
import { useServicesValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { isServiceValid } from '@/Components/CreateImageWizard/validators';
import { useSecuritySummary } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import {
  addDisabledService,
  addEnabledService,
  addMaskedService,
  removeDisabledService,
  removeEnabledService,
  removeMaskedService,
  selectServices,
} from '@/store/slices/wizard';

const ServicesInput = () => {
  const disabledServices = useAppSelector(selectServices).disabled;
  const maskedServices = useAppSelector(selectServices).masked;
  const enabledServices = useAppSelector(selectServices).enabled;

  const stepValidation = useServicesValidation();

  const { services: requiredServices } = useSecuritySummary();

  const disabledRequiredByProfile = disabledServices.filter((service) =>
    requiredServices.disabled.includes(service),
  );

  const maskedRequiredByProfile = maskedServices.filter((service) =>
    requiredServices.masked.includes(service),
  );

  const enabledRequiredByProfile = enabledServices.filter((service) =>
    requiredServices.enabled.includes(service),
  );

  return (
    <>
      <FormGroup isRequired={false} label='Enabled services'>
        <LabelInput
          ariaLabel='Add enabled systemd service'
          placeholder='Add enabled service'
          validator={isServiceValid}
          list={enabledServices.filter(
            (service) => !enabledRequiredByProfile.includes(service),
          )}
          requiredList={enabledRequiredByProfile}
          item='Enabled service'
          addAction={addEnabledService}
          removeAction={removeEnabledService}
          stepValidation={stepValidation}
          fieldName='enabledSystemdServices'
          chipCollapseThreshold={8}
          helperText='These services are currently active and set to start automatically at boot.'
        />
      </FormGroup>
      <FormGroup isRequired={false} label='Disabled services'>
        <LabelInput
          ariaLabel='Add disabled systemd service'
          placeholder='Add disabled service'
          validator={isServiceValid}
          list={disabledServices.filter(
            (service) => !disabledRequiredByProfile.includes(service),
          )}
          requiredList={disabledRequiredByProfile}
          item='Disabled service'
          addAction={addDisabledService}
          removeAction={removeDisabledService}
          stepValidation={stepValidation}
          fieldName='disabledSystemdServices'
          chipCollapseThreshold={8}
          helperText='These services are installed but will not start automatically at boot.'
        />
      </FormGroup>
      <FormGroup isRequired={false} label='Masked services'>
        <LabelInput
          ariaLabel='Add masked systemd service'
          placeholder='Add masked service'
          validator={isServiceValid}
          list={maskedServices.filter(
            (service) => !maskedRequiredByProfile.includes(service),
          )}
          requiredList={maskedRequiredByProfile}
          item='Masked service'
          addAction={addMaskedService}
          removeAction={removeMaskedService}
          stepValidation={stepValidation}
          fieldName='maskedSystemdServices'
          chipCollapseThreshold={8}
          helperText='These services are completely blocked from being started manually or automatically.'
        />
      </FormGroup>
    </>
  );
};

export default ServicesInput;
