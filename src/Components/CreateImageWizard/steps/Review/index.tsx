import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import {
  selectBlueprintDescription,
  selectBlueprintName,
} from '@/store/slices';
import { useFlag } from '@/Utilities/useGetEnvironment';

import Review from './components/ReviewStep';

const FormHeader = () => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);

  if (isWizardRevampEnabled) return null;

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
      <Review />
    </Form>
  );
};

export default ReviewStep;
