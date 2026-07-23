import React, { useState } from 'react';

import {
  Button,
  Card,
  Content,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';

const EmptyCard = ({ openForm }: { openForm: (arg0: boolean) => void }) => {
  return (
    <Card variant='secondary' className='pf-v6-u-mt-md pf-v6-u-py-md'>
      <EmptyState titleText='Login to select an image' headingLevel='h4'>
        <EmptyStateBody>
          <Content>Registry images come from registry.redhat.io.</Content>
          <Content>
            Sign in to browse available images for this release.
          </Content>
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button onClick={() => openForm(true)}>Login</Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    </Card>
  );
};

const RegistryAuth = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  if (!isFormVisible) {
    return <EmptyCard openForm={setIsFormVisible} />;
  }

  // we'll add the login form back in the next commit
  return null;
};

export default RegistryAuth;
