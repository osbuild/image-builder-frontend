import React, { useState } from 'react';

import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  Flex,
  FlexItem,
  Text,
} from '@patternfly/react-core';
import {
  TextContent,
  TextList,
  TextListItem,
} from '@patternfly/react-core/dist/esm';
// Import for optional quickstarts functionality
// import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

type NewAlertPropTypes = {
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
};

export const NewAlert = ({ setShowAlert }: NewAlertPropTypes) => {
  const isAlertDismissed = window.localStorage.getItem(
    'imageBuilder.newFeatureNewCustomizationsAlertDismissed'
  );
  const [displayAlert, setDisplayAlert] = useState(!isAlertDismissed);

  const dismissAlert = () => {
    setDisplayAlert(false);
    window.localStorage.setItem(
      'imageBuilder.newFeatureNewCustomizationsAlertDismissed',
      'true'
    );
  };

  // Optional quickstarts functionality
  // const { quickStarts } = useChrome();
  // const activateQuickstart = (qs: string) => () =>
  //   quickStarts.activateQuickstart(qs);

  if (displayAlert) {
    return (
      <Alert
        isExpandable
        style={{ margin: '0 0 16px 0' }}
        title="New in Images: more customizations"
        actionClose={<AlertActionCloseButton onClose={dismissAlert} />}
        actionLinks={
          <>
            <Flex>
              {/*
              <FlexItem>
                Optional quickstarts link
                  <AlertActionLink
                    onClick={activateQuickstart(
                      'insights-creating-blueprint-images'
                    )}
                  >
                    Get started with blueprints
                  </AlertActionLink>
              </FlexItem>
              */}
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
        <TextContent>
          <Text>
            New options for blueprint customization are now available:
          </Text>
          <TextList>
            <TextListItem>Timezone</TextListItem>
            <TextListItem>Locale</TextListItem>
            <TextListItem>Hostname</TextListItem>
            <TextListItem>Kernel</TextListItem>
            <TextListItem>Firewall</TextListItem>
            <TextListItem>Systemd services</TextListItem>
          </TextList>
        </TextContent>
      </Alert>
    );
  } else {
    return;
  }
};
