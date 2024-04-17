import React from 'react';

import { Form, Title } from '@patternfly/react-core';

import Review from './ReviewStep';

const ReviewStep = ({
  snapshottingEnabled,
}: {
  snapshottingEnabled: boolean;
}) => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Review
      </Title>
      {/* Intentional prop drilling for simplicity - To be removed */}
      <Review snapshottingEnabled={snapshottingEnabled} />
    </Form>
  );
};

export default ReviewStep;
