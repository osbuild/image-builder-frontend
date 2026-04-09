import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { useCustomizationRestrictions } from '@/store/api/distributions';
import { useAppSelector } from '@/store/hooks';
import {
  selectBlueprintDescription,
  selectBlueprintName,
  selectImageTypes,
} from '@/store/slices';
import { useFlag } from '@/Utilities/useGetEnvironment';

import {
  ImageOverview,
  ReadyToBuildAlert,
  Registration,
  RepeatableBuild,
  Review,
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

  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: environments,
  });

  return (
    <Form>
      <FormHeader />
      <ImageOverview />
      <Registration restrictions={restrictions} />
      <RepeatableBuild restrictions={restrictions} />
      <Security restrictions={restrictions} />
      <Review />
    </Form>
  );
};

export default ReviewStep;
