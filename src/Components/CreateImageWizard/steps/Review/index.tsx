import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import {
  selectBlueprintDescription,
  selectBlueprintName,
} from '@/store/slices';
import { useFlag } from '@/Utilities/useGetEnvironment';

import { ImageOverview, ReadyToBuildAlert, Review } from './components';

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
  return (
    <Form>
      <FormHeader />
      <ImageOverview />
      <Review />
    </Form>
  );
};

export default ReviewStep;
