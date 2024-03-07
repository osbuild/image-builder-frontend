import React from 'react';

import { Form, Title } from '@patternfly/react-core';

import Review from './ReviewStep';

const ReviewStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Review
      </Title>
      <Review />
    </Form>
  );
};

export default ReviewStep;
