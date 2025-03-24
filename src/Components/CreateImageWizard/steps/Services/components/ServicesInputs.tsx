import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { useAppSelector } from '../../../../../store/hooks';
import { useGetOscapCustomizationsQuery } from '../../../../../store/imageBuilderApi';
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
} from '../../../../../store/wizardSlice';
import LabelInput from '../../../LabelInput';
import { useServicesValidation } from '../../../utilities/useValidation';
import { isServiceValid } from '../../../validators';

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
    }
  );

  const disabledRequiredByOpenSCAP = disabledServices.filter((service) =>
    oscapProfileInfo?.services?.disabled?.includes(service)
  );

  const maskedRequiredByOpenSCAP = maskedServices.filter((service) =>
    oscapProfileInfo?.services?.masked?.includes(service)
  );

  const enabledRequiredByOpenSCAP = enabledServices.filter((service) =>
    oscapProfileInfo?.services?.enabled?.includes(service)
  );

  return (
    <>
      <FormGroup isRequired={false} label="Disabled services">
        <LabelInput
          ariaLabel="Add disabled service"
          placeholder="Add disabled service"
          validator={isServiceValid}
          list={disabledServices.filter(
            (service) =>
              !oscapProfileInfo?.services?.disabled?.includes(service)
          )}
          requiredList={disabledRequiredByOpenSCAP}
          requiredCategoryName="Required by OpenSCAP"
          item="Disabled service"
          addAction={addDisabledService}
          removeAction={removeDisabledService}
          stepValidation={stepValidation}
          fieldName="disabledSystemdServices"
        />
      </FormGroup>
      <FormGroup isRequired={false} label="Masked services">
        <LabelInput
          ariaLabel="Add masked service"
          placeholder="Add masked service"
          validator={isServiceValid}
          list={maskedServices.filter(
            (service) => !oscapProfileInfo?.services?.masked?.includes(service)
          )}
          requiredList={maskedRequiredByOpenSCAP}
          requiredCategoryName="Required by OpenSCAP"
          item="Masked service"
          addAction={addMaskedService}
          removeAction={removeMaskedService}
          stepValidation={stepValidation}
          fieldName="maskedSystemdServices"
        />
      </FormGroup>
      <FormGroup isRequired={false} label="Enabled services">
        <LabelInput
          ariaLabel="Add enabled service"
          placeholder="Add enabled service"
          validator={isServiceValid}
          list={enabledServices.filter(
            (service) => !enabledRequiredByOpenSCAP.includes(service)
          )}
          requiredList={enabledRequiredByOpenSCAP}
          requiredCategoryName="Required by OpenSCAP"
          item="Enabled service"
          addAction={addEnabledService}
          removeAction={removeEnabledService}
          stepValidation={stepValidation}
          fieldName="enabledSystemdServices"
        />
      </FormGroup>
    </>
  );
};

export default ServicesInput;
