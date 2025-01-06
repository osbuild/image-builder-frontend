import React from 'react';

import { Form, Text, Title } from '@patternfly/react-core';

import Review from './ReviewStep';

import { useAppSelector } from '../../../../store/hooks';
import {
  selectBlueprintDescription,
  selectBlueprintName,
} from '../../../../store/wizardSlice';
import { useGenerateDefaultName } from '../../utilities/useGenerateDefaultName';

const ReviewStep = ({
  snapshottingEnabled,
}: {
  snapshottingEnabled: boolean;
}) => {
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);

  useGenerateDefaultName();

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Review {blueprintName} blueprint
      </Title>
      {blueprintDescription && <Text>{blueprintDescription}</Text>}
      {/* Intentional prop drilling for simplicity - To be removed */}
      <Review snapshottingEnabled={snapshottingEnabled} />
    </Form>
  );
};

export default ReviewStep;
