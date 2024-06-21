import React from 'react';

import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';
import { Text } from '@patternfly/react-core/dist/dynamic/components/Text';
import { Title } from '@patternfly/react-core/dist/dynamic/components/Title';

import Review from './ReviewStep';

import { useAppSelector } from '../../../../store/hooks';
import {
  selectBlueprintDescription,
  selectBlueprintName,
} from '../../../../store/wizardSlice';

const ReviewStep = ({
  snapshottingEnabled,
}: {
  snapshottingEnabled: boolean;
}) => {
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);

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
