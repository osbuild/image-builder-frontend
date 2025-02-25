import React from 'react';

import { Form, Text, Title } from '@patternfly/react-core';

import Review from './ReviewStep';

import { useAppSelector } from '../../../../store/hooks';
import {
  selectBlueprintDescription,
  selectBlueprintName,
} from '../../../../store/wizardSlice';

const ReviewStep = () => {
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Review {blueprintName} blueprint
      </Title>
      {blueprintDescription && <Text>{blueprintDescription}</Text>}
      <Review />
    </Form>
  );
};

export default ReviewStep;
