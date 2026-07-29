import React, { useState } from 'react';

import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  Content,
  Flex,
  FlexItem,
} from '@patternfly/react-core';

const TITLE =
  'Blueprints are transitioning to single image target environments.';
const BODY =
  'Existing multi-target blueprints will be migrated to single-target configurations.';

const SingleTargetAlert = () => {
  const localStorageKey = 'imageBuilder.singleTargetMigration.dismissed';
  const isAlertDismissed = window.localStorage.getItem(localStorageKey);

  const [displayAlert, setDisplayAlert] = useState(!isAlertDismissed);
  const [isTemporarilyHidden, setIsTemporarilyHidden] = useState(false);

  const dismissAlert = () => {
    setDisplayAlert(false);
    window.localStorage.setItem(localStorageKey, 'true');
  };

  if (!displayAlert || isTemporarilyHidden) {
    return null;
  }

  return (
    <Alert
      data-testid='single-target-migration-banner'
      isExpandable
      variant='warning'
      style={{ margin: '0 0 16px 0' }}
      title={TITLE}
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
      <Content>
        {BODY}{' '}
        <a
          href='https://access.redhat.com/articles/7145853'
          target='_blank'
          rel='noopener noreferrer'
        >
          Learn more about this upcoming change
        </a>
      </Content>
    </Alert>
  );
};

export default SingleTargetAlert;
