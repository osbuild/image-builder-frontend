import React, { useState } from 'react';

import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  Content,
  Flex,
  FlexItem,
} from '@patternfly/react-core';

// Import for optional quickstarts functionality
// import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

type NewAlertPropTypes = {
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
};

export const NewAlert = ({ setShowAlert }: NewAlertPropTypes) => {
  const isAlertDismissed = window.localStorage.getItem(
    'imageBuilder.newFeatureNewCustomizationsAlertDismissed', // TODO: update when new feature
  );
  const [displayAlert, setDisplayAlert] = useState(!isAlertDismissed);

  const dismissAlert = () => {
    setDisplayAlert(false);
    window.localStorage.setItem(
      'imageBuilder.newFeatureNewCustomizationsAlertDismissed', // TODO: update when new feature
      'true',
    );
  };

  // Optional quickstarts functionality
  // const { quickStarts } = useChrome();
  // const activateQuickstart = (qs: string) => () =>
  //   quickStarts.activateQuickstart(qs);

  if (displayAlert) {
    return (
      <Alert
        data-testid='new-in-image-builder-banner'
        isExpandable
        style={{ margin: '0 0 16px 0' }}
        title='New in image builder: ...' // TODO: update when new feature
        actionClose={
          <Flex>
            <FlexItem>
              <AlertActionLink onClick={dismissAlert}>
                Don&apos;t show me this again
              </AlertActionLink>
            </FlexItem>
            <FlexItem>
              <AlertActionCloseButton onClose={() => setShowAlert(false)} />
            </FlexItem>
          </Flex>
        }
      >
        <Content>{/* New feature alert content */}</Content>
      </Alert>
    );
  } else {
    return;
  }
};
