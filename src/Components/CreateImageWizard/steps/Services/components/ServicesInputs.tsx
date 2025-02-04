import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { useAppSelector } from '../../../../../store/hooks';
import { useGetOscapCustomizationsQuery } from '../../../../../store/imageBuilderApi';
import {
  addDisabledService,
  addEnabledService,
  removeDisabledService,
  removeEnabledService,
  selectComplianceProfileID,
  selectDistribution,
  selectServices,
} from '../../../../../store/wizardSlice';
import ChippingInput from '../../../ChippingInput';
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

  const disabledAndMaskedRequiredByOpenSCAP = disabledServices
    .concat(maskedServices)
    .filter(
      (service) =>
        oscapProfileInfo?.services?.disabled?.includes(service) ||
        oscapProfileInfo?.services?.masked?.includes(service)
    );

  const enabledRequiredByOpenSCAP = enabledServices.filter((service) =>
    oscapProfileInfo?.services?.enabled?.includes(service)
  );

  return (
    <>
      <FormGroup isRequired={false} label="Disabled services">
        <ChippingInput
          ariaLabel="Add disabled service"
          placeholder="Add disabled service"
          validator={isServiceValid}
          list={disabledServices
            .concat(maskedServices)
            .filter(
              (service) =>
                !disabledAndMaskedRequiredByOpenSCAP.includes(service)
            )}
          requiredList={disabledAndMaskedRequiredByOpenSCAP}
          item="Disabled service"
          addAction={addDisabledService}
          removeAction={removeDisabledService}
          stepValidation={stepValidation}
          fieldName="disabledSystemdServices"
        />
      </FormGroup>
      <FormGroup isRequired={false} label="Enabled services">
        <ChippingInput
          ariaLabel="Add enabled service"
          placeholder="Add enabled service"
          validator={isServiceValid}
          list={enabledServices.filter(
            (service) => !enabledRequiredByOpenSCAP.includes(service)
          )}
          requiredList={enabledRequiredByOpenSCAP}
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
