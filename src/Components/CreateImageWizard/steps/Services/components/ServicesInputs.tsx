import React from 'react';

import { FormGroup, HelperText, HelperTextItem } from '@patternfly/react-core';

import LabelInput from '@/Components/CreateImageWizard/LabelInput';
import { useServicesValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { isServiceValid } from '@/Components/CreateImageWizard/validators';
import { useGetOscapCustomizationsQuery } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import {
  addDisabledService,
  addEnabledService,
  addMaskedService,
  removeDisabledService,
  removeEnabledService,
  removeMaskedService,
  selectComplianceProfileID,
  selectDistribution,
  selectServices,
} from '@/store/slices/wizard';

const ServicesInput = () => {
  const disabledServices = useAppSelector(selectServices).disabled;
  const maskedServices = useAppSelector(selectServices).masked;
  const enabledServices = useAppSelector(selectServices).enabled;

  const stepValidation = useServicesValidation();

  const release = useAppSelector(selectDistribution);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);

  const { data: oscapProfileInfo } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if complianceProfileID is undefined the query is going to get skipped, so it's safe here to ignore the linter here
      profile: complianceProfileID,
    },
    {
      skip: !complianceProfileID,
    },
  );

  const disabledRequiredByOpenSCAP = disabledServices.filter((service) =>
    oscapProfileInfo?.services?.disabled?.includes(service),
  );

  const maskedRequiredByOpenSCAP = maskedServices.filter((service) =>
    oscapProfileInfo?.services?.masked?.includes(service),
  );

  const enabledRequiredByOpenSCAP = enabledServices.filter((service) =>
    oscapProfileInfo?.services?.enabled?.includes(service),
  );

  return (
    <>
      <FormGroup isRequired={false} label='Enabled services'>
        <LabelInput
          ariaLabel='Add enabled service'
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
        />
        <HelperText className='pf-v6-u-pt-sm'>
          <HelperTextItem>
            These services are currently active and set to start automatically
            at boot.
          </HelperTextItem>
        </HelperText>
      </FormGroup>
      <FormGroup isRequired={false} label='Disabled services'>
        <LabelInput
          ariaLabel='Add disabled service'
          placeholder='Add disabled service'
          validator={isServiceValid}
          list={disabledServices.filter(
            (service) =>
              !oscapProfileInfo?.services?.disabled?.includes(service),
          )}
          requiredList={disabledRequiredByOpenSCAP}
          item='Disabled service'
          addAction={addDisabledService}
          removeAction={removeDisabledService}
          stepValidation={stepValidation}
          fieldName='disabledSystemdServices'
          chipCollapseThreshold={8}
        />
        <HelperText className='pf-v6-u-pt-sm'>
          <HelperTextItem>
            These services are installed but will not start automatically at
            boot.
          </HelperTextItem>
        </HelperText>
      </FormGroup>
      <FormGroup isRequired={false} label='Masked services'>
        <LabelInput
          ariaLabel='Add masked service'
          placeholder='Add masked service'
          validator={isServiceValid}
          list={maskedServices.filter(
            (service) => !oscapProfileInfo?.services?.masked?.includes(service),
          )}
          requiredList={maskedRequiredByOpenSCAP}
          item='Masked service'
          addAction={addMaskedService}
          removeAction={removeMaskedService}
          stepValidation={stepValidation}
          fieldName='maskedSystemdServices'
          chipCollapseThreshold={8}
        />
        <HelperText className='pf-v6-u-pt-sm'>
          <HelperTextItem>
            These services are completely blocked from being started manually or
            automatically.
          </HelperTextItem>
        </HelperText>
      </FormGroup>
    </>
  );
};

export default ServicesInput;
