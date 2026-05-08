import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { useSecuritySummary } from '@/store/api/backend';
import { useCustomizationRestrictions } from '@/store/api/distributions';
import { useAppSelector } from '@/store/hooks';
import {
  selectBlueprintDescription,
  selectBlueprintName,
  selectImageTypes,
} from '@/store/slices';
import { useFlag } from '@/Utilities/useGetEnvironment';

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
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);
  const isValid = useIsBlueprintValid();

  if (isWizardRevampEnabled) {
    return isValid ? <ReadyToBuildAlert /> : null;
  }

  return (
    <>
      <Title headingLevel='h1' size='xl'>
        Review {blueprintName} blueprint
      </Title>
      {blueprintDescription && <Content>{blueprintDescription}</Content>}
    </>
  );
};

const ReviewStep = () => {
  const environments = useAppSelector(selectImageTypes);
  const security = useSecuritySummary();

  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: environments,
  });

  return (
    <Form>
      <FormHeader />
      <ImageOverview />
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
    </Form>
  );
};

export default ReviewStep;
