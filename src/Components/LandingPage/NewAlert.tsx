import React from 'react';

import { Alert, Text } from '@patternfly/react-core';

export const NewAlert = () => {
  return (
    <Alert title="New in Images: Blueprints!">
      <Text>
        Blueprints make it easier for you to manage your images. Images expire
        after two weeks, but blueprints last forever. Create a blueprint for
        your “golden image”, modify it over time as your needs change, and use
        it to build and deploy images on demand.
      </Text>
    </Alert>
  );
};
