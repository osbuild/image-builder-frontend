import React, { useState } from 'react';

import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { AlertActionCloseButton } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { AlertActionLink } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Text } from '@patternfly/react-core/dist/dynamic/components/Text';
import { Flex } from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import { FlexItem } from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

type NewAlertPropTypes = {
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
};

export const NewAlert = ({ setShowAlert }: NewAlertPropTypes) => {
  const isAlertDismissed = window.localStorage.getItem(
    'imageBuilder.newFeatureBlueprintsAlertDismissed'
  );
  const [displayAlert, setDisplayAlert] = useState(!isAlertDismissed);

  const dismissAlert = () => {
    setDisplayAlert(false);
    window.localStorage.setItem(
      'imageBuilder.newFeatureBlueprintsAlertDismissed',
      'true'
    );
  };

  const { quickStarts } = useChrome();
  const activateQuickstart = (qs: string) => () =>
    quickStarts.activateQuickstart(qs);

  if (displayAlert) {
    return (
      <Alert
        style={{ margin: '0 0 16px 0' }}
        title="New in Images: Blueprints!"
        actionClose={<AlertActionCloseButton onClose={dismissAlert} />}
        actionLinks={
          <>
            <Flex>
              <FlexItem>
                <AlertActionLink
                  onClick={activateQuickstart(
                    'insights-creating-blueprint-images'
                  )}
                >
                  Get started with blueprints
                </AlertActionLink>
              </FlexItem>
              <FlexItem>
                <AlertActionLink onClick={() => setShowAlert(false)}>
                  Not now
                </AlertActionLink>
              </FlexItem>

              <FlexItem align={{ default: 'alignRight' }}>
                <AlertActionLink onClick={dismissAlert}>
                  Don&apos;t show me this again
                </AlertActionLink>
              </FlexItem>
            </Flex>
          </>
        }
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
