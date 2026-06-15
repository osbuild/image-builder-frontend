import React from 'react';

import { useSecuritySummary } from '@/store/api/backend';
import { useCustomizationRestrictions } from '@/store/api/distributions';
import { useAppSelector } from '@/store/hooks';
import { selectImageTypes } from '@/store/slices';

import {
  AdvancedSettingsOverview,
  ContentOverview,
  ImageOverview,
  ReadyToBuildAlert,
  Registration,
  RepeatableBuild,
  Security,
} from './components';

import { useIsBlueprintValid } from '../../utilities/useValidation';

const FormHeader = () => {
  const isValid = useIsBlueprintValid();
  return isValid ? <ReadyToBuildAlert /> : null;
};

const ReviewStep = () => {
  const environments = useAppSelector(selectImageTypes);
  const security = useSecuritySummary();

  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: environments,
  });

  return (
    <>
      <FormHeader />
      <ImageOverview restrictions={restrictions} />
      <Registration restrictions={restrictions} />
      <RepeatableBuild restrictions={restrictions} />
      <Security restrictions={restrictions} security={security} />
      <ContentOverview
        restrictions={restrictions}
        oscapPackages={security.packages}
      />
      {Object.values(restrictions).some((r) => !r.shouldHide) && (
        <AdvancedSettingsOverview
          restrictions={restrictions}
          oscapKernelArgs={security.kernel.append}
          oscapServices={security.services}
        />
      )}
    </>
  );
};

export default ReviewStep;
