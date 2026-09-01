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

  const { services: oscapServices } = useSecuritySummary();

  const disabledRequiredByOpenSCAP = disabledServices.filter((service) =>
    oscapServices.disabled.includes(service),
  );

  const maskedRequiredByOpenSCAP = maskedServices.filter((service) =>
    oscapServices.masked.includes(service),
  );

  const enabledRequiredByOpenSCAP = enabledServices.filter((service) =>
    oscapServices.enabled.includes(service),
  );

  return (
    <>
      <FormGroup isRequired={false} label='Enabled services'>
        <LabelInput
          ariaLabel='Add enabled systemd service'
          placeholder='Add enabled service'
          validator={isServiceValid}
          list={enabledServices.filter(
            (service) => !enabledRequiredByOpenSCAP.includes(service),
          )}
          requiredList={enabledRequiredByOpenSCAP}
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
            (service) => !disabledRequiredByOpenSCAP.includes(service),
          )}
          requiredList={disabledRequiredByOpenSCAP}
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
            (service) => !maskedRequiredByOpenSCAP.includes(service),
          )}
          requiredList={maskedRequiredByOpenSCAP}
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
