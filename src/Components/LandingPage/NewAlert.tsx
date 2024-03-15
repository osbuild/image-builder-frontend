import React, { useState } from 'react';

import { Alert, AlertActionCloseButton, Text } from '@patternfly/react-core';

export const NewAlert = () => {
  const isAlertDismissed = window.localStorage.getItem(
    'imageBuilder.alertDismissed'
  );
  const [displayAlert, setDisplayAlert] = useState(!isAlertDismissed);

  const dismissAlert = () => {
    setDisplayAlert(false);
    window.localStorage.setItem('imageBuilder.alertDismissed', 'true');
  };

  if (displayAlert) {
    return (
      <Alert
        title="New in Images: Blueprints!"
        actionClose={<AlertActionCloseButton onClose={dismissAlert} />}
      >
        <Text>
          Blueprints make it easier for you to manage your images. Images expire
          after two weeks, but blueprints last forever. Create a blueprint for
          your “golden image”, modify it over time as your needs change, and use
          it to build and deploy images on demand.
        </Text>
      </Alert>
    );
  } else {
    return;
  }
};
