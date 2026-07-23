import React, { useState } from 'react';

import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  Content,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { useVariant } from '@unleash/proxy-client-react';

const SingleTargetAlert = () => {
  const variant = useVariant('image-builder.single-target-migration');
  let payload;
  try {
    payload = variant.payload ? JSON.parse(variant.payload.value) : undefined;
  } catch {
    payload = undefined;
  }

  const title = payload?.title || '';
  const body = payload?.body || '';
  const localStorageKey = payload?.localStorageKey || '';

  const isAlertDismissed = localStorageKey
    ? window.localStorage.getItem(localStorageKey)
    : false;

  const [displayAlert, setDisplayAlert] = useState(!isAlertDismissed);
  const [isTemporarilyHidden, setIsTemporarilyHidden] = useState(false);

  const dismissAlert = () => {
    setDisplayAlert(false);
    if (localStorageKey) {
      window.localStorage.setItem(localStorageKey, 'true');
    }
  };

  if (!variant.enabled || !displayAlert || isTemporarilyHidden || !title) {
    return null;
  }

  return (
    <Alert
      data-testid='single-target-migration-banner'
      isExpandable
      variant='warning'
      style={{ margin: '0 0 16px 0' }}
      title={title}
      actionClose={
        <Flex>
          <FlexItem>
            <AlertActionLink onClick={dismissAlert}>
              Don&apos;t show me this again
            </AlertActionLink>
          </FlexItem>
          <FlexItem>
            <AlertActionCloseButton
              onClose={() => setIsTemporarilyHidden(true)}
            />
          </FlexItem>
        </Flex>
      }
    >
      <Content>{body}</Content>
    </Alert>
  );
};

export default SingleTargetAlert;
