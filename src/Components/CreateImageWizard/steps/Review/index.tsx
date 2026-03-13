import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import {
  selectBlueprintDescription,
  selectBlueprintName,
} from '@/store/slices/wizard';

import Review from './ReviewStep';

import { useAppSelector } from '../../../../store/hooks';

const ReviewStep = () => {
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);

  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Review {blueprintName} blueprint
      </Title>
      {blueprintDescription && <Content>{blueprintDescription}</Content>}
      <Review />
    </Form>
  );
};

export default ReviewStep;
